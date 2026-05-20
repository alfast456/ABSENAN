<x-filament-widgets::widget>
    <x-filament::section wire:poll.3s="fetchLatestLogs">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold">Live Attendance Feed</h2>
            <div class="flex items-center space-x-2 text-sm text-green-500">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span>Live</span>
            </div>
        </div>

        <div class="space-y-4">
            @forelse($latestLogs as $log)
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-500">
                    <div class="flex items-center space-x-4">
                        @if(!empty($log['photo_path']))
                            <img src="{{ Storage::url($log['photo_path']) }}" alt="Photo" class="rounded-full object-cover shadow-sm flex-shrink-0" style="width: 36px; height: 36px;">
                        @else
                            <div class="rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold shadow-sm flex-shrink-0" style="width: 36px; height: 36px;">
                                {{ substr($log['employee']['name'] ?? 'U', 0, 1) }}
                            </div>
                        @endif
                        
                        <div>
                            <p class="font-bold text-gray-900 dark:text-white">
                                {{ $log['employee']['name'] ?? 'Unknown' }}
                            </p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">
                                {{ \Carbon\Carbon::parse($log['scan_time'])->format('d M Y, H:i') }}
                            </p>
                        </div>
                    </div>
                    
                    <div class="flex sm:justify-end">
                        @if($log['attendance_type'] === 'checkin')
                            <x-filament::badge color="success" class="w-fit">
                                Check In
                            </x-filament::badge>
                        @else
                            <x-filament::badge color="warning" class="w-fit">
                                Check Out
                            </x-filament::badge>
                        @endif
                    </div>
                </div>
            @empty
                <div class="text-center py-6 text-gray-500 dark:text-gray-400">
                    No recent attendance logs.
                </div>
            @endforelse
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
