<?php

namespace App\Filament\Resources\Payrolls\Pages;

use App\Filament\Resources\Payrolls\PayrollResource;
use App\Services\PayrollService;
use Filament\Actions\CreateAction;
use Filament\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListPayrolls extends ListRecords
{
    protected static string $resource = PayrollResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('calculate_payroll')
                ->label('Calculate Monthly Payroll')
                ->icon('heroicon-o-cpu-chip')
                ->color('primary')
                ->form([
                    TextInput::make('month')
                        ->label('Month (YYYY-MM)')
                        ->required()
                        ->placeholder('e.g. 2026-05')
                        ->default(now()->format('Y-m'))
                        ->regex('/^\d{4}-\d{2}$/'),
                ])
                ->action(function (array $data) {
                    $month = $data['month'];
                    $service = new PayrollService();
                    $count = $service->calculateAll($month);

                    Notification::make()
                        ->title('Payroll Calculated')
                        ->body("Successfully generated/updated {$count} payroll records for {$month}.")
                        ->success()
                        ->send();
                }),
            CreateAction::make(),
        ];
    }
}
