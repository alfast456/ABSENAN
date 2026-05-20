<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateShiftRotation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'shift:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate shift schedules for employees based on rotation rules';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting smart shift generation for the next 7 days...');

        $employees = \App\Models\Employee::all();
        $shifts = \App\Models\Shift::all();

        if ($shifts->isEmpty()) {
            $this->error('No shifts found in the database. Please create shifts first.');
            return;
        }

        $startDate = now()->startOfWeek(); // Start from this Monday
        $weeksFromEpoch = $startDate->diffInWeeks(now()->startOfYear()); // Get week number

        $daysToGenerate = 7; // Seminggu

        foreach ($employees as $employee) {
            $groupString = $employee->shift_group_id ?: 'Default';
            $groupId = crc32($groupString); // Convert string to integer for math operations
            
            // Logika Rotasi Mingguan:
            // Shift index ditentukan oleh (Minggu ke berapa + Hash ID Grup) % Total Shift
            // Sehingga setiap minggu, shift karyawan di grup tersebut akan berputar.
            $shiftIndex = (int)($weeksFromEpoch + $groupId) % $shifts->count();
            $assignedShift = $shifts->values()->get($shiftIndex);

            for ($i = 0; $i < $daysToGenerate; $i++) {
                $workDate = $startDate->copy()->addDays($i)->format('Y-m-d');

                \App\Models\ShiftSchedule::updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'work_date' => $workDate,
                    ],
                    [
                        'shift_id' => $assignedShift->id,
                    ]
                );
            }
        }

        $this->info('Smart shift generation completed successfully!');
    }
}
