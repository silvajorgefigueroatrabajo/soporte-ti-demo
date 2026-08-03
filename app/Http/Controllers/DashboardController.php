<?php

namespace App\Http\Controllers;

use App\Models\SupportCase;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $filters = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
            'explorer_from' => ['nullable', 'date_format:Y-m-d'],
            'explorer_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:explorer_from'],
            'explorer_status' => ['nullable', Rule::in(config('support.statuses'))],
            'explorer_type' => ['nullable', 'string', 'max:255'],
            'explorer_center' => ['nullable', 'string', 'max:255'],
            'explorer_shift' => ['nullable', Rule::in(config('support.shifts'))],
            'explorer_group' => ['nullable', Rule::in(['type', 'center', 'status', 'day', 'shift'])],
            'explorer_metric' => ['nullable', Rule::in(['count', 'average_time', 'resolution_rate'])],
            'explorer_chart' => ['nullable', Rule::in(['bar', 'donut', 'table'])],
        ]);

        $months = SupportCase::query()
            ->orderByDesc('reported_date')
            ->pluck('reported_date')
            ->map(fn ($date) => Carbon::parse($date)->format('Y-m'))
            ->unique()
            ->filter()
            ->values();

        $selectedMonth = $request->string('month')->toString()
            ?: ($months->first() ?? now()->format('Y-m'));
        $monthStart = Carbon::createFromFormat('Y-m', $selectedMonth)->startOfMonth();
        $query = SupportCase::query()->whereBetween('reported_date', [
            $monthStart->toDateString(),
            $monthStart->copy()->endOfMonth()->toDateString(),
        ]);
        $previousStart = $monthStart->copy()->subMonthNoOverflow()->startOfMonth();
        $previousTotal = SupportCase::query()->whereBetween('reported_date', [
            $previousStart->toDateString(), $previousStart->copy()->endOfMonth()->toDateString(),
        ])->count();

        $byStatus = (clone $query)->select('status', DB::raw('count(*) as total'))->groupBy('status')->pluck('total', 'status');
        $byType = (clone $query)->select('case_type', DB::raw('count(*) as total'))->groupBy('case_type')->orderByDesc('total')->pluck('total', 'case_type');

        $byCenter = (clone $query)->selectRaw("COALESCE(NULLIF(center, ''), 'Sin centro') as label, count(*) as total")
            ->groupBy('label')->orderByDesc('total')->limit(8)->pluck('total', 'label');
        $byDay = (clone $query)->select('reported_date', DB::raw('count(*) as total'))
            ->groupBy('reported_date')->orderBy('reported_date')->pluck('total', 'reported_date');
        $total = (clone $query)->count();
        $durations = (clone $query)->whereNotNull('reported_time')->whereNotNull('resolved_time')
            ->get(['reported_date', 'reported_time', 'resolved_time'])
            ->map(function (SupportCase $case): int {
                $start = Carbon::parse($case->reported_date->format('Y-m-d').' '.$case->reported_time);
                $end = Carbon::parse($case->reported_date->format('Y-m-d').' '.$case->resolved_time);
                if ($end->lessThan($start)) {
                    $end->addDay();
                }

                return (int) $start->diffInMinutes($end);
            });

        $explorer = $this->buildExplorer($filters, $monthStart);

        return Inertia::render('dashboard', [
            'selectedMonth' => $selectedMonth,
            'months' => $months->when(! $months->contains($selectedMonth), fn ($items) => $items->prepend($selectedMonth))->values(),
            'summary' => [
                'total' => $total,
                'resolved' => (int) ($byStatus['Resuelto'] ?? 0),
                'escalated' => (int) ($byStatus['Escalado'] ?? 0),
                'unanswered' => (int) ($byStatus['Sin Respuesta'] ?? 0),
                'resolutionRate' => $total > 0 ? (int) round(((int) ($byStatus['Resuelto'] ?? 0) / $total) * 100) : 0,
                'averageResolutionMinutes' => $durations->isNotEmpty() ? (int) round($durations->average()) : null,
                'within30Rate' => $durations->isNotEmpty() ? (int) round(($durations->filter(fn (int $minutes) => $minutes <= 30)->count() / $durations->count()) * 100) : null,
                'timedCases' => $durations->count(),
                'monthlyChange' => $previousTotal > 0 ? (int) round((($total - $previousTotal) / $previousTotal) * 100) : null,
            ],
            'byStatus' => collect(config('support.statuses'))->map(fn (string $status) => [
                'label' => $status,
                'value' => (int) ($byStatus[$status] ?? 0),
            ])->values(),
            'byType' => $byType->map(fn ($count, $type) => ['label' => $type, 'value' => (int) $count])->values(),
            'byCenter' => $byCenter->map(fn ($count, $center) => ['label' => $center, 'value' => (int) $count])->values(),
            'byDay' => $byDay->map(fn ($count, $date) => ['label' => Carbon::parse($date)->format('d/m'), 'value' => (int) $count])->values(),
            'explorer' => $explorer,
        ]);
    }

    private function buildExplorer(array $filters, Carbon $monthStart): array
    {
        $from = $filters['explorer_from'] ?? $monthStart->toDateString();
        $to = $filters['explorer_to'] ?? $monthStart->copy()->endOfMonth()->toDateString();
        $group = $filters['explorer_group'] ?? 'type';
        $metric = $filters['explorer_metric'] ?? 'count';
        $chart = $filters['explorer_chart'] ?? 'bar';
        $cases = SupportCase::query()->whereBetween('reported_date', [$from, $to])
            ->when($filters['explorer_status'] ?? null, fn ($query, string $value) => $query->where('status', $value))
            ->when($filters['explorer_type'] ?? null, fn ($query, string $value) => $query->where('case_type', $value))
            ->when($filters['explorer_center'] ?? null, fn ($query, string $value) => $query->where('center', $value))
            ->when($filters['explorer_shift'] ?? null, fn ($query, string $value) => $query->where('shift', $value))
            ->get();

        $grouped = $cases->groupBy(function (SupportCase $case) use ($group): string {
            return match ($group) {
                'center' => $case->center ?: 'Sin centro',
                'status' => $case->status,
                'day' => $case->reported_date->format('d/m/Y'),
                'shift' => $case->shift,
                default => $case->case_type,
            };
        });
        $data = $grouped->map(function ($items, string $label) use ($metric): array {
            $value = match ($metric) {
                'average_time' => $this->averageMinutes($items),
                'resolution_rate' => $items->count() > 0 ? round(($items->where('status', 'Resuelto')->count() / $items->count()) * 100, 1) : 0,
                default => $items->count(),
            };

            return ['label' => $label, 'value' => $value ?? 0, 'cases' => $items->count()];
        })->sortByDesc('value')->values();

        return [
            'filters' => ['from' => $from, 'to' => $to, 'status' => $filters['explorer_status'] ?? '',
                'type' => $filters['explorer_type'] ?? '', 'center' => $filters['explorer_center'] ?? '',
                'shift' => $filters['explorer_shift'] ?? '', 'group' => $group, 'metric' => $metric, 'chart' => $chart],
            'data' => $data,
            'options' => [
                'statuses' => config('support.statuses'), 'shifts' => config('support.shifts'),
                'types' => SupportCase::query()->distinct()->orderBy('case_type')->pluck('case_type')->filter()->values(),
                'centers' => SupportCase::query()->distinct()->orderBy('center')->pluck('center')->filter()->values(),
            ],
        ];
    }

    private function averageMinutes($cases): ?float
    {
        $durations = $cases->filter(fn (SupportCase $case) => $case->reported_time && $case->resolved_time)
            ->map(function (SupportCase $case): int {
                $start = Carbon::parse($case->reported_date->format('Y-m-d').' '.$case->reported_time);
                $end = Carbon::parse($case->reported_date->format('Y-m-d').' '.$case->resolved_time);
                if ($end->lessThan($start)) {
                    $end->addDay();
                }

                return (int) $start->diffInMinutes($end);
            });

        return $durations->isNotEmpty() ? round($durations->average(), 1) : null;
    }
}
