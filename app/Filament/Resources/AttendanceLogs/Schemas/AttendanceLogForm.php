<?php

namespace App\Filament\Resources\AttendanceLogs\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class AttendanceLogForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('employee_id')
                    ->required()
                    ->numeric(),
                TextInput::make('attendance_type')
                    ->required(),
                DateTimePicker::make('scan_time')
                    ->required(),
                TextInput::make('latitude')
                    ->required()
                    ->numeric(),
                TextInput::make('longitude')
                    ->required()
                    ->numeric(),
                TextInput::make('distance')
                    ->required()
                    ->numeric(),
                TextInput::make('face_confidence')
                    ->required()
                    ->numeric(),
                TextInput::make('photo_path')
                    ->required(),
                TextInput::make('device_id'),
                TextInput::make('status')
                    ->required()
                    ->default('valid'),
            ]);
    }
}
