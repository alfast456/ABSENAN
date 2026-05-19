<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;
use Livewire\Attributes\On;

class RealtimeAttendanceWidget extends Widget
{
    protected string $view = 'filament.widgets.realtime-attendance-widget';

    public $latestAttendances = [];

    #[On('echo:attendance-channel,AttendanceLogged')]
    public function onAttendanceLogged($event)
    {
        array_unshift($this->latestAttendances, $event['attendanceLog']);
        if (count($this->latestAttendances) > 5) {
            array_pop($this->latestAttendances);
        }
    }
}
