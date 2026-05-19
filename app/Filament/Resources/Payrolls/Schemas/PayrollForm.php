<?php

namespace App\Filament\Resources\Payrolls\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Schemas\Schema;
use App\Models\Employee;

class PayrollForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('employee_id')
                    ->label('Employee')
                    ->options(Employee::all()->pluck('name', 'id'))
                    ->searchable()
                    ->required(),
                TextInput::make('month')
                    ->placeholder('e.g. 2026-05')
                    ->required(),
                TextInput::make('base_salary')
                    ->numeric()
                    ->required(),
                TextInput::make('overtime_pay')
                    ->numeric()
                    ->default(0),
                TextInput::make('late_deduction')
                    ->numeric()
                    ->default(0),
                TextInput::make('net_salary')
                    ->numeric()
                    ->required(),
                Select::make('payment_status')
                    ->options([
                        'pending' => 'Pending',
                        'paid' => 'Paid',
                    ])
                    ->default('pending')
                    ->required(),
            ]);
    }
}
