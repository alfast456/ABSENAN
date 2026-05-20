<?php

namespace App\Filament\Widgets;

use App\Models\Employee;
use App\Models\AttendanceLog;
use Filament\Widgets\Widget;
use Carbon\Carbon;

class EmployeeProductivityWidget extends Widget
{
    protected string $view = 'filament.widgets.employee-productivity-widget';

    protected static ?int $sort = 4;
    protected int | string | array $columnSpan = 'full';

    public $riskyEmployees = [];

    public function mount()
    {
        // 1. Calculate Lateness Risk for last 30 days
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $employees = Employee::all();
        $logs = AttendanceLog::where('scan_time', '>=', $thirtyDaysAgo)
            ->where('attendance_type', 'checkin')
            ->get()
            ->groupBy('employee_id');

        $riskData = [];

        foreach ($employees as $employee) {
            $empLogs = $logs->get($employee->id, collect());
            $totalCheckins = $empLogs->count();
            
            if ($totalCheckins === 0) continue;

            $lateCount = 0;
            foreach ($empLogs as $log) {
                // Determine if late (Naive approach assuming 08:00 AM shift start)
                $scanTime = Carbon::parse($log->scan_time);
                if ($scanTime->format('H:i:s') > '08:15:00') {
                    $lateCount++;
                }
            }

            $latenessProbability = ($lateCount / $totalCheckins) * 100;
            
            $riskLevel = 'Low';
            $riskColor = 'success';
            if ($latenessProbability > 50) {
                $riskLevel = 'High';
                $riskColor = 'danger';
            } elseif ($latenessProbability > 20) {
                $riskLevel = 'Medium';
                $riskColor = 'warning';
            }

            if ($latenessProbability > 0) {
                $riskData[] = [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'total_checkins' => $totalCheckins,
                    'late_count' => $lateCount,
                    'probability' => round($latenessProbability, 1),
                    'risk_level' => $riskLevel,
                    'risk_color' => $riskColor,
                ];
            }
        }

        // Sort by highest probability
        usort($riskData, function($a, $b) {
            return $b['probability'] <=> $a['probability'];
        });

        // Take top 5 risky employees
        $this->riskyEmployees = array_slice($riskData, 0, 5);
    }
}
