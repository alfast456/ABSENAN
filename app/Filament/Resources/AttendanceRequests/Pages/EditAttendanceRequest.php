<?php

namespace App\Filament\Resources\AttendanceRequests\Pages;

use App\Filament\Resources\AttendanceRequests\AttendanceRequestResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditAttendanceRequest extends EditRecord
{
    protected static string $resource = AttendanceRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
