<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('id_ID');

        // 1. Admin User
        \App\Models\User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
            ]
        );

        // 2. Office Locations
        $office = \App\Models\OfficeLocation::firstOrCreate(
            ['name' => 'Kantor Pusat'],
            [
                'latitude' => -6.200000,
                'longitude' => 106.816666,
                'radius_meter' => 100,
            ]
        );

        // 3. Shifts
        $shiftPagi = \App\Models\Shift::firstOrCreate(
            ['shift_name' => 'Pagi'],
            [
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'break_time' => '12:00:00',
            ]
        );
        
        $shiftMalam = \App\Models\Shift::firstOrCreate(
            ['shift_name' => 'Malam'],
            [
                'start_time' => '20:00:00',
                'end_time' => '05:00:00',
                'break_time' => '00:00:00',
            ]
        );

        // 4. Employees
        $employees = [];
        for ($i = 1; $i <= 5; $i++) {
            $employees[] = \App\Models\Employee::firstOrCreate(
                ['email' => "employee{$i}@test.com"],
                [
                    'employee_code' => 'EMP' . str_pad($i, 3, '0', STR_PAD_LEFT),
                    'name' => $faker->name,
                    'password' => bcrypt('password'),
                    'department_id' => 'IT',
                    'shift_group_id' => $i % 2 == 0 ? 'Group B' : 'Group A',
                    'status' => 'active',
                ]
            );
        }

        // 5. Devices, Schedules, Logs, Requests, Overtimes
        foreach ($employees as $employee) {
            // Devices
            \App\Models\Device::firstOrCreate(
                ['employee_id' => $employee->id],
                [
                    'device_uuid' => $faker->uuid,
                    'device_name' => 'Device ' . $employee->name,
                    'last_login' => now(),
                ]
            );

            // Shift Schedules for the next 3 days
            for ($d = 0; $d < 3; $d++) {
                \App\Models\ShiftSchedule::firstOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'work_date' => now()->addDays($d)->toDateString(),
                    ],
                    [
                        'shift_id' => $employee->shift_group_id == 'Group A' ? $shiftPagi->id : $shiftMalam->id,
                    ]
                );
            }

            // Attendance Logs (Dummy check-in for today)
            \App\Models\AttendanceLog::firstOrCreate(
                [
                    'employee_id' => $employee->id,
                    'attendance_type' => 'checkin',
                    'scan_time' => now()->subHours(rand(1, 4))->format('Y-m-d H:i:s'),
                ],
                [
                    'latitude' => $office->latitude + 0.0001,
                    'longitude' => $office->longitude + 0.0001,
                    'distance' => 15.5,
                    'face_confidence' => 99.9,
                    'photo_path' => 'dummy/photo.jpg',
                    'status' => 'valid',
                ]
            );

            // Attendance Requests
            if (rand(0, 1)) {
                \App\Models\AttendanceRequest::firstOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'request_type' => 'leave',
                    ],
                    [
                        'description' => 'Acara keluarga',
                        'status' => 'pending',
                    ]
                );
            }

            // Overtimes
            if (rand(0, 1)) {
                \App\Models\Overtime::firstOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'date' => now()->subDay()->toDateString(),
                    ],
                    [
                        'start_time' => '17:00:00',
                        'end_time' => '19:00:00',
                        'reason' => 'Fixing bug in production',
                        'status' => 'pending',
                    ]
                );
            }
        }
    }
}
