<?php

namespace App\Filament\Resources\Employees\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class EmployeeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('employee_code')
                    ->required(),
                TextInput::make('name')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                TextInput::make('password')
                    ->password()
                    ->required(),
                TextInput::make('department_id'),
                TextInput::make('shift_group_id'),
                TextInput::make('status')
                    ->required()
                    ->default('active'),
                TextInput::make('base_salary')
                    ->numeric()
                    ->default(0),
                TextInput::make('annual_leave_quota')
                    ->numeric()
                    ->default(12),
            ]);
    }
}
