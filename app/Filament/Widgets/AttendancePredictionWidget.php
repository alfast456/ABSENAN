<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Models\ShiftSchedule;
use Carbon\Carbon;

class AttendancePredictionWidget extends BaseWidget
{
    protected static ?int $sort = 2;

    protected function getStats(): array
    {
        // 1. Calculate Late Rate in last 30 days
        $thirtyDaysAgo = now()->subDays(30)->startOfDay();
        $checkinLogs = AttendanceLog::where('attendance_type', 'checkin')
            ->where('status', 'valid')
            ->where('scan_time', '>=', $thirtyDaysAgo)
            ->get();

        $totalCheckins = $checkinLogs->count();
        $lateCount = 0;
        $employeeLateCounts = [];

        foreach ($checkinLogs as $log) {
            $logTime = Carbon::parse($log->scan_time);
            $logDateStr = $logTime->toDateString();

            $schedule = ShiftSchedule::with('shift')
                ->where('employee_id', $log->employee_id)
                ->where('work_date', $logDateStr)
                ->first();

            if ($schedule && $schedule->shift) {
                $shiftStart = Carbon::parse($logDateStr . ' ' . $schedule->shift->start_time);
                if ($logTime->greaterThan($shiftStart)) {
                    $lateCount++;
                    $employeeId = $log->employee_id;
                    $employeeLateCounts[$employeeId] = ($employeeLateCounts[$employeeId] ?? 0) + 1;
                }
            }
        }

        $lateRate = $totalCheckins > 0 ? round(($lateCount / $totalCheckins) * 100, 1) : 0;

        // Find employee with highest late count (Risk Alert)
        $riskDescription = "No critical late risk detected";
        $riskColor = "success";
        
        if (!empty($employeeLateCounts)) {
            arsort($employeeLateCounts);
            $highestLateEmployeeId = array_key_first($employeeLateCounts);
            $highestLateCount = $employeeLateCounts[$highestLateEmployeeId];
            
            if ($highestLateCount >= 2) {
                $riskyEmployee = Employee::find($highestLateEmployeeId);
                if ($riskyEmployee) {
                    $riskDescription = "Alert: {$riskyEmployee->name} ({$highestLateCount}x late)";
                    $riskColor = "danger";
                }
            }
        }

        // 2. Predict Tomorrow's Attendance Rate (AI Moving Average Prediction)
        $tomorrow = now()->addDay();
        $dayOfWeek = $tomorrow->dayOfWeek; // 0 (Sunday) to 6 (Saturday)
        
        // Let's sample attendance rates on this same day of the week for the last 3 weeks
        $sampleDays = [
            now()->subWeeks(1)->day($dayOfWeek)->toDateString(),
            now()->subWeeks(2)->day($dayOfWeek)->toDateString(),
            now()->subWeeks(3)->day($dayOfWeek)->toDateString(),
        ];

        $totalActiveEmployees = Employee::where('status', 'active')->count();
        $rates = [];

        foreach ($sampleDays as $sampleDay) {
            $presentCount = AttendanceLog::where('attendance_type', 'checkin')
                ->where('status', 'valid')
                ->whereDate('scan_time', $sampleDay)
                ->distinct('employee_id')
                ->count();
            
            if ($totalActiveEmployees > 0) {
                $rates[] = ($presentCount / $totalActiveEmployees) * 100;
            }
        }

        // AI Prediction with a baseline fallback if no historical data is available
        $predictedRate = count($rates) > 0 && array_sum($rates) > 0
            ? round(array_sum($rates) / count($rates), 1)
            : 90.0; // Baseline default prediction

        return [
            Stat::make('Average Late Rate', $lateRate . '%')
                ->description($totalCheckins > 0 ? "{$lateCount} out of {$totalCheckins} check-ins" : "No attendance logs yet")
                ->descriptionIcon($lateRate > 15 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->color($lateRate > 15 ? 'danger' : 'success'),

            Stat::make('Tomorrow Prediction', $predictedRate . '%')
                ->description('AI forecast based on weekday historical trends')
                ->descriptionIcon('heroicon-m-sparkles')
                ->color('info'),

            Stat::make('Late Risk Alert', count($employeeLateCounts) > 0 ? count($employeeLateCounts) . ' Employees' : 'Clear')
                ->description($riskDescription)
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color($riskColor),
        ];
    }
}
