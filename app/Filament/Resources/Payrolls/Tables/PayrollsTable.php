<?php

namespace App\Filament\Resources\Payrolls\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Actions\Action;
use App\Models\Payroll;

class PayrollsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('employee.name')
                    ->label('Employee Name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('month')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('base_salary')
                    ->prefix('Rp ')
                    ->numeric(decimalPlaces: 0, decimalSeparator: ',', thousandsSeparator: '.')
                    ->sortable(),
                TextColumn::make('overtime_pay')
                    ->prefix('Rp ')
                    ->numeric(decimalPlaces: 0, decimalSeparator: ',', thousandsSeparator: '.')
                    ->sortable(),
                TextColumn::make('late_deduction')
                    ->prefix('Rp ')
                    ->numeric(decimalPlaces: 0, decimalSeparator: ',', thousandsSeparator: '.')
                    ->sortable(),
                TextColumn::make('net_salary')
                    ->prefix('Rp ')
                    ->numeric(decimalPlaces: 0, decimalSeparator: ',', thousandsSeparator: '.')
                    ->sortable(),
                TextColumn::make('payment_status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'paid' => 'success',
                        'pending' => 'warning',
                    })
                    ->sortable(),
                TextColumn::make('calculated_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
                Action::make('mark_as_paid')
                    ->label('Mark Paid')
                    ->color('success')
                    ->icon('heroicon-o-check-circle')
                    ->hidden(fn (Payroll $record): bool => $record->payment_status === 'paid')
                    ->action(fn (Payroll $record) => $record->update(['payment_status' => 'paid']))
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
