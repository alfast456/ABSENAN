<x-filament-widgets::widget>
    <x-filament::section>
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold flex items-center gap-2">
                <x-heroicon-o-chart-bar class="w-5 h-5 text-primary-500" />
                AI Productivity & Lateness Analytics (Last 30 Days)
            </h2>
        </div>

        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Predictive analysis highlighting employees with the highest probability of arriving late based on recent historical data.
        </p>

        <div class="space-y-4">
            @forelse($riskyEmployees as $emp)
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <div>
                        <p class="font-bold text-gray-900 dark:text-white">
                            {{ $emp['name'] }}
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Late {{ $emp['late_count'] }} times out of {{ $emp['total_checkins'] }} check-ins.
                        </p>
                    </div>
                    
                    <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1">
                        <span class="text-sm font-bold text-{{ $emp['risk_color'] }}-600 dark:text-{{ $emp['risk_color'] }}-400">
                            {{ $emp['probability'] }}% Lateness Prob.
                        </span>
                        <x-filament::badge :color="$emp['risk_color']">
                            {{ $emp['risk_level'] }} Risk
                        </x-filament::badge>
                    </div>
                </div>
            @empty
                <div class="text-center py-6 text-gray-500 dark:text-gray-400">
                    Great! No employees have shown significant lateness risk recently.
                </div>
            @endforelse
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
