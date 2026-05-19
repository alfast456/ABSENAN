<?php

namespace App\Filament\Resources\AttendanceRequests\Pages;

use App\Filament\Resources\AttendanceRequests\AttendanceRequestResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAttendanceRequests extends ListRecords
{
    protected static string $resource = AttendanceRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
