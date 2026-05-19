<x-filament-widgets::widget>
    <x-filament::section>
        <h2 class="text-lg font-bold mb-4">Live Attendance Feed</h2>
        <div class="space-y-2">
            @forelse($latestAttendances as $log)
                <div class="p-3 bg-gray-50 rounded shadow-sm flex justify-between items-center dark:bg-gray-800">
                    <div>
                        <span class="font-semibold text-primary-600">Employee #{{ $log['employee_id'] }}</span>
                        <span class="text-sm text-gray-500 ml-2">did a {{ $log['attendance_type'] ?? 'scan' }}</span>
                    </div>
                    <span class="text-xs text-gray-400">{{ \Carbon\Carbon::parse($log['scan_time'] ?? now())->diffForHumans() }}</span>
                </div>
            @empty
                <div class="text-gray-500 text-sm">Waiting for live scans...</div>
            @endforelse
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
