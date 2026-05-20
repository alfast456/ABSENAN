<?php

namespace App\Filament\Widgets;

use App\Models\AttendanceLog;
use Filament\Widgets\Widget;
use Livewire\Attributes\On;

class LiveAttendanceFeed extends Widget
{
    protected string $view = 'filament.widgets.live-attendance-feed';

    protected static ?int $sort = 3;
    protected int | string | array $columnSpan = 'full';

    public $latestLogs = [];

    public function mount()
    {
        $this->fetchLatestLogs();
    }

    public function fetchLatestLogs()
    {
        $this->latestLogs = AttendanceLog::with('employee')
            ->orderBy('scan_time', 'desc')
            ->take(5)
            ->get()
            ->toArray();
    }
}
