<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use App\Models\Payroll;
use Illuminate\Support\Facades\DB;

class PayrollSummaryChart extends ChartWidget
{
    protected ?string $heading = 'Monthly Payroll Expense';
    protected static ?int $sort = 3;

    protected function getData(): array
    {
        // Fetch net_salary sum grouped by month
        $payrolls = Payroll::select('month', DB::raw('SUM(net_salary) as total'))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->limit(12)
            ->get();

        $labels = $payrolls->pluck('month')->toArray();
        $data = $payrolls->pluck('total')->toArray();

        return [
            'datasets' => [
                [
                    'label' => 'Total Payroll (IDR)',
                    'data' => $data,
                    'backgroundColor' => '#3b82f6',
                    'borderColor' => '#3b82f6',
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
