<?php

namespace App\Filament\Exports;

use App\Models\AttendanceLog;
use Filament\Actions\Exports\ExportColumn;
use Filament\Actions\Exports\Exporter;
use Filament\Actions\Exports\Models\Export;
use Illuminate\Support\Number;

class AttendanceLogExporter extends Exporter
{
    protected static ?string $model = AttendanceLog::class;

    public static function getColumns(): array
    {
        return [
            ExportColumn::make('id')
                ->label('ID'),
            ExportColumn::make('employee_id'),
            ExportColumn::make('attendance_type'),
            ExportColumn::make('scan_time'),
            ExportColumn::make('latitude'),
            ExportColumn::make('longitude'),
            ExportColumn::make('distance'),
            ExportColumn::make('face_confidence'),
            ExportColumn::make('photo_path'),
            ExportColumn::make('device_id'),
            ExportColumn::make('status'),
            ExportColumn::make('created_at'),
            ExportColumn::make('updated_at'),
        ];
    }

    public static function getCompletedNotificationBody(Export $export): string
    {
        $body = 'Your attendance log export has completed and ' . Number::format($export->successful_rows) . ' ' . str('row')->plural($export->successful_rows) . ' exported.';

        if ($failedRowsCount = $export->getFailedRowsCount()) {
            $body .= ' ' . Number::format($failedRowsCount) . ' ' . str('row')->plural($failedRowsCount) . ' failed to export.';
        }

        return $body;
    }
}
