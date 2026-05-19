<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\AttendanceLog;
use App\Models\Overtime;
use App\Models\ShiftSchedule;
use Carbon\Carbon;

class PayrollService
{
    /**
     * Calculate and save payroll for a specific employee and month.
     *
     * @param Employee $employee
     * @param string $month (Format: YYYY-MM, e.g., '2026-05')
     * @return Payroll
     */
    public function calculate(Employee $employee, string $month): Payroll
    {
        $startDate = Carbon::parse($month . '-01')->startOfMonth();
        $endDate = Carbon::parse($month . '-01')->endOfMonth();

        // 1. Base Salary
        $baseSalary = $employee->base_salary ?? 5000000.00;

        // 2. Overtime Pay calculation
        // Rate: 50,000 IDR per hour
        $overtimeRate = 50000.00;
        $totalOvertimeHours = 0;

        $approvedOvertimes = Overtime::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->get();

        foreach ($approvedOvertimes as $overtime) {
            $start = Carbon::parse($overtime->start_time);
            $end = Carbon::parse($overtime->end_time);
            
            // If overtime goes overnight, handle appropriately
            if ($end->lessThan($start)) {
                $end->addDay();
            }
            
            $hours = $start->diffInMinutes($end) / 60.0;
            $totalOvertimeHours += $hours;
        }

        $overtimePay = $totalOvertimeHours * $overtimeRate;

        // 3. Late Deduction calculation
        // Penalty: 20,000 IDR per late day
        $latePenalty = 20000.00;
        $lateCount = 0;
        $lateDates = [];

        // Get all valid checkin logs in this month
        $checkinLogs = AttendanceLog::where('employee_id', $employee->id)
            ->where('attendance_type', 'checkin')
            ->where('status', 'valid')
            ->whereBetween('scan_time', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->get();

        foreach ($checkinLogs as $log) {
            $logTime = Carbon::parse($log->scan_time);
            $logDateStr = $logTime->toDateString();

            // Only check if we haven't already marked this day as late
            if (in_array($logDateStr, $lateDates)) {
                continue;
            }

            // Find shift schedule for this employee on this specific date
            $schedule = ShiftSchedule::with('shift')
                ->where('employee_id', $employee->id)
                ->where('work_date', $logDateStr)
                ->first();

            if ($schedule && $schedule->shift) {
                $shiftStartStr = $schedule->shift->start_time; // format e.g. "08:00:00"
                $shiftStart = Carbon::parse($logDateStr . ' ' . $shiftStartStr);

                // If checkin scan time is after shift start time, increment late count
                if ($logTime->greaterThan($shiftStart)) {
                    $lateCount++;
                    $lateDates[] = $logDateStr;
                }
            }
        }

        $lateDeduction = $lateCount * $latePenalty;

        // 4. Net Salary
        $netSalary = $baseSalary + $overtimePay - $lateDeduction;
        if ($netSalary < 0) {
            $netSalary = 0;
        }

        // 5. Save or update record
        return Payroll::updateOrCreate(
            [
                'employee_id' => $employee->id,
                'month' => $month,
            ],
            [
                'base_salary' => $baseSalary,
                'overtime_pay' => $overtimePay,
                'late_deduction' => $lateDeduction,
                'net_salary' => $netSalary,
                'calculated_at' => now(),
            ]
        );
    }

    /**
     * Calculate payroll for all active employees for a given month.
     *
     * @param string $month (Format: YYYY-MM)
     * @return int Number of payroll records calculated
     */
    public function calculateAll(string $month): int
    {
        $employees = Employee::where('status', 'active')->get();
        $count = 0;

        foreach ($employees as $employee) {
            $this->calculate($employee, $month);
            $count++;
        }

        return $count;
    }
}
