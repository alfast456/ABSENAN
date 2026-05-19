<?php

namespace App\Filament\Resources\AttendanceRequests;

use App\Filament\Resources\AttendanceRequests\Pages\CreateAttendanceRequest;
use App\Filament\Resources\AttendanceRequests\Pages\EditAttendanceRequest;
use App\Filament\Resources\AttendanceRequests\Pages\ListAttendanceRequests;
use App\Filament\Resources\AttendanceRequests\Schemas\AttendanceRequestForm;
use App\Filament\Resources\AttendanceRequests\Tables\AttendanceRequestsTable;
use App\Models\AttendanceRequest;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AttendanceRequestResource extends Resource
{
    protected static ?string $model = AttendanceRequest::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return AttendanceRequestForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AttendanceRequestsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAttendanceRequests::route('/'),
            'create' => CreateAttendanceRequest::route('/create'),
            'edit' => EditAttendanceRequest::route('/{record}/edit'),
        ];
    }
}
