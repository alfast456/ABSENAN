<?php

namespace App\Filament\Exports;

use App\Models\Payroll;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;
use Illuminate\Support\Number;

class PayrollExporter extends Exporter
{
    protected static ?string $model = Payroll::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('id')
                ->label('ID'),
            ExportColumn::make('employee.name'),
            ExportColumn::make('month'),
            ExportColumn::make('base_salary'),
            ExportColumn::make('overtime_pay'),
            ExportColumn::make('late_deduction'),
            ExportColumn::make('net_salary'),
            ExportColumn::make('payment_status'),
            ExportColumn::make('calculated_at'),
            ExportColumn::make('created_at'),
            ExportColumn::make('updated_at'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        $body = 'Your payroll export has completed and ' . Number::format($export->successful_rows) . ' ' . str('row')->plural($export->successful_rows) . ' exported.';

        if ($failedRowsCount = $export->getFailedRowsCount()) {
            $body .= ' ' . Number::format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' failed to export.';
        }

        return $body;
    }
}
