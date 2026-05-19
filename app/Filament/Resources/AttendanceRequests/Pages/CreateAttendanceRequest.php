<?php

namespace App\Filament\Resources\AttendanceRequests\Pages;

use App\Filament\Resources\AttendanceRequests\AttendanceRequestResource;
use Filament\Resources\Pages\CreateRecord;

class CreateAttendanceRequest extends CreateRecord
{
    protected static string $resource = AttendanceRequestResource::class;
}
