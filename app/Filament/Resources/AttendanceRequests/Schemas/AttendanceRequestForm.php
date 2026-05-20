<?php

namespace App\Filament\Resources\AttendanceRequests\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class AttendanceRequestForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Forms\Components\Select::make('employee_id')
                    ->relationship('employee', 'name')
                    ->searchable()
                    ->required(),
                \Filament\Forms\Components\Select::make('request_type')
                    ->options([
                        'leave' => 'Cuti',
                        'sick' => 'Sakit',
                        'permission' => 'Izin',
                    ])
                    ->required(),
                Textarea::make('description')
                    ->required()
                    ->columnSpanFull(),
                \Filament\Forms\Components\DatePicker::make('start_date')
                    ->required(),
                \Filament\Forms\Components\DatePicker::make('end_date')
                    ->required(),
                \Filament\Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                    ])
                    ->required()
                    ->default('pending'),
                \Filament\Forms\Components\Select::make('approved_by')
                    ->relationship('approver', 'name')
                    ->searchable(),
            ]);
    }
}
