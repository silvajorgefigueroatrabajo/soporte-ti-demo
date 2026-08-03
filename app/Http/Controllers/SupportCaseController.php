<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Center;
use App\Models\Driver;
use App\Models\SupportCase;
use App\Models\SupportOption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SupportCaseController extends Controller
{
    public function similar(Request $request): JsonResponse
    {
        $this->authorizeTechnician($request);
        $data = $request->validate([
            'description' => ['nullable', 'string', 'max:500'],
            'type' => ['nullable', 'string', 'max:255'],
            'center' => ['nullable', 'string', 'max:255'],
            'driver' => ['nullable', 'string', 'max:255'],
        ]);
        $words = collect(preg_split('/\s+/u', $data['description'] ?? '', -1, PREG_SPLIT_NO_EMPTY))
            ->map(fn (string $word) => trim($word, '.,;:!?()'))
            ->filter(fn (string $word) => mb_strlen($word) >= 5)->unique()->take(4);

        if (empty($data['type']) && empty($data['center']) && empty($data['driver']) && $words->isEmpty()) {
            return response()->json([]);
        }

        $cases = SupportCase::query()
            ->where(function ($query) use ($data, $words) {
                if (! empty($data['type'])) {
                    $query->orWhere('case_type', $data['type']);
                }
                if (! empty($data['center'])) {
                    $query->orWhere('center', $data['center']);
                }
                if (! empty($data['driver'])) {
                    $query->orWhere('driver', $data['driver']);
                }
                foreach ($words as $word) {
                    $query->orWhere('description', 'like', "%{$word}%");
                }
            })
            ->latest('reported_date')->limit(5)->get()
            ->map(fn (SupportCase $case) => [
                'id' => $case->id, 'date' => $case->reported_date->format('d-m-Y'),
                'type' => $case->case_type, 'center' => $case->center,
                'description' => $case->description, 'observations' => $case->observations,
                'status' => $case->status,
            ]);

        return response()->json($cases);
    }

    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(config('support.statuses'))],
            'date' => ['nullable', 'date_format:Y-m-d'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'type' => ['nullable', 'string', 'max:255'],
            'center' => ['nullable', 'string', 'max:255'],
            'shift' => ['nullable', Rule::in(config('support.shifts'))],
        ]);
        $user = $request->user();

        $cases = SupportCase::query()
            ->with('user:id,name')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('description', 'like', "%{$search}%")
                        ->orWhere('reporter', 'like', "%{$search}%")
                        ->orWhere('driver', 'like', "%{$search}%")
                        ->orWhere('center', 'like', "%{$search}%")
                        ->orWhere('case_type', 'like', "%{$search}%")
                        ->orWhere('transport', 'like', "%{$search}%");
                });
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['date'] ?? null, fn ($query, string $date) => $query->whereDate('reported_date', $date))
            ->when($filters['date_from'] ?? null, fn ($query, string $date) => $query->whereDate('reported_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, string $date) => $query->whereDate('reported_date', '<=', $date))
            ->when($filters['type'] ?? null, fn ($query, string $type) => $query->where('case_type', $type))
            ->when($filters['center'] ?? null, function ($query, string $center) {
                $query->when(
                    $center === '__empty__',
                    fn ($query) => $query->where(fn ($query) => $query->whereNull('center')->orWhere('center', '')),
                    fn ($query) => $query->where('center', $center),
                );
            })
            ->when($filters['shift'] ?? null, fn ($query, string $shift) => $query->where('shift', $shift))
            ->latest('reported_date')->latest('reported_time')
            ->paginate(15)->withQueryString()
            ->through(fn (SupportCase $case) => [
                ...$this->serializeCase($case),
                'created_by' => $case->user->name,
                'can_manage' => $user->role === 'technician' && $case->user_id === $user->id,
            ]);

        return Inertia::render('support-cases/index', [
            'cases' => $cases,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
                'date' => $filters['date'] ?? '',
                'date_from' => $filters['date_from'] ?? '',
                'date_to' => $filters['date_to'] ?? '',
                'type' => $filters['type'] ?? '',
                'center' => $filters['center'] ?? '',
                'shift' => $filters['shift'] ?? '',
            ],
            'statuses' => config('support.statuses'),
            'filterOptions' => [
                'types' => SupportCase::query()->whereNotNull('case_type')->where('case_type', '!=', '')
                    ->distinct()->orderBy('case_type')->pluck('case_type'),
                'centers' => SupportCase::query()->whereNotNull('center')->where('center', '!=', '')
                    ->distinct()->orderBy('center')->pluck('center'),
                'shifts' => config('support.shifts'),
            ],
            'canCreate' => $user->role === 'technician',
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorizeTechnician($request);

        return Inertia::render('support-cases/create', [
            'technician' => $request->user()->name,
            'shift' => $request->user()->shift,
            'options' => $this->formOptions(),
            'lastCase' => $request->user()->supportCases()->latest('reported_date')->latest('reported_time')->first()?->only([
                'reporter', 'driver', 'center', 'case_type', 'description', 'observations',
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeTechnician($request);
        $validated = $this->validateCase($request);
        $validated['technician'] = $request->user()->name;
        $validated['shift'] = $this->configuredShift($request);

        DB::transaction(function () use ($request, $validated) {
            $this->persistOptions($validated);
            $case = $request->user()->supportCases()->create($validated);
            ActivityLog::record('created', $case, "Registró el caso #{$case->id}");
        });

        return to_route('support-cases.index')->with('toast', [
            'type' => 'success', 'message' => 'Caso registrado correctamente.',
        ]);
    }

    public function edit(Request $request, SupportCase $supportCase): Response
    {
        $this->authorizeOwner($request, $supportCase);

        return Inertia::render('support-cases/edit', [
            'case' => $this->serializeCase($supportCase),
            'technician' => $request->user()->name,
            'options' => $this->formOptions(),
        ]);
    }

    public function update(Request $request, SupportCase $supportCase): RedirectResponse
    {
        $this->authorizeOwner($request, $supportCase);
        $validated = $this->validateCase($request);
        $validated['technician'] = $request->user()->name;

        DB::transaction(function () use ($supportCase, $validated) {
            $this->persistOptions($validated);
            $before = $supportCase->only(array_keys($validated));
            $supportCase->update($validated);
            ActivityLog::record('updated', $supportCase, "Actualizó el caso #{$supportCase->id}", [
                'before' => $before, 'after' => $supportCase->only(array_keys($validated)),
            ]);
        });

        return to_route('support-cases.index')->with('toast', [
            'type' => 'success', 'message' => 'Caso actualizado correctamente.',
        ]);
    }

    public function destroy(Request $request, SupportCase $supportCase): RedirectResponse
    {
        $this->authorizeOwner($request, $supportCase);
        ActivityLog::record('deleted', $supportCase, "Eliminó el caso #{$supportCase->id}");
        $supportCase->delete();

        return to_route('support-cases.index')->with('toast', [
            'type' => 'success', 'message' => 'Caso eliminado correctamente.',
        ]);
    }

    private function authorizeTechnician(Request $request): void
    {
        abort_unless($request->user()->role === 'technician', 403);
    }

    private function authorizeOwner(Request $request, SupportCase $supportCase): void
    {
        abort_unless(
            $request->user()->role === 'technician' && $supportCase->user_id === $request->user()->id,
            403,
        );
    }

    private function validateCase(Request $request): array
    {
        $validated = $request->validate([
            'reported_date' => ['required', 'date_format:Y-m-d'],
            'reported_time' => ['required', 'date_format:H:i'],
            'resolved_time' => ['nullable', 'date_format:H:i'],
            'reporter' => ['required', 'string', 'max:255'],
            'driver' => ['nullable', 'string', 'max:255'],
            'center' => ['nullable', 'string', 'max:255'],
            'case_type' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'status' => ['required', Rule::in(config('support.statuses'))],
            'observations' => ['nullable', 'string', 'max:5000'],
            'transport' => ['nullable', 'string', 'max:255'],
        ]);
        $validated['reporter'] = trim($validated['reporter']);
        $validated['case_type'] = trim($validated['case_type']);
        $validated['driver'] = isset($validated['driver']) ? trim($validated['driver']) : null;
        $validated['center'] = isset($validated['center']) ? trim($validated['center']) : null;
        $validated['transport'] = isset($validated['transport']) ? trim($validated['transport']) : null;

        return $validated;
    }

    private function configuredShift(Request $request): string
    {
        $shift = $request->user()->shift;

        if (! in_array($shift, config('support.shifts'), true)) {
            throw ValidationException::withMessages([
                'shift' => 'Debes configurar tu turno antes de registrar un caso.',
            ]);
        }

        return $shift;
    }

    private function persistOptions(array $values): void
    {
        foreach (['reporter', 'case_type', 'driver', 'center'] as $category) {
            if (! empty($values[$category])) {
                SupportOption::query()->firstOrCreate(['category' => $category, 'name' => $values[$category]]);
                if ($category === 'driver') {
                    Driver::query()->firstOrCreate(['name' => $values[$category]]);
                }
                if ($category === 'center') {
                    Center::query()->firstOrCreate(['name' => $values[$category]]);
                }
            }
        }
    }

    private function formOptions(): array
    {
        $options = SupportOption::query()->where('active', true)->orderBy('name')
            ->get(['category', 'name'])->groupBy('category');

        return [
            'statuses' => config('support.statuses'),
            'reporters' => $options->get('reporter', collect())->pluck('name')->values(),
            'case_types' => $options->get('case_type', collect())->pluck('name')->values(),
            'drivers' => Driver::query()->orderBy('name')->pluck('name')
                ->merge($options->get('driver', collect())->pluck('name'))->unique()->values(),
            'driver_centers' => Driver::query()->whereNotNull('center_name')->pluck('center_name', 'name'),
            'centers' => Center::query()->orderBy('name')->pluck('name')
                ->merge($options->get('center', collect())->pluck('name'))->unique()->values(),
        ];
    }

    private function serializeCase(SupportCase $case): array
    {
        return [
            'id' => $case->id,
            'reported_date' => $case->reported_date->format('Y-m-d'),
            'reported_time' => $case->reported_time ? substr($case->reported_time, 0, 5) : null,
            'resolved_time' => $case->resolved_time ? substr($case->resolved_time, 0, 5) : null,
            'shift' => $case->shift,
            'technician' => $case->technician,
            'reporter' => $case->reporter,
            'driver' => $case->driver,
            'center' => $case->center,
            'case_type' => $case->case_type,
            'description' => $case->description,
            'status' => $case->status,
            'observations' => $case->observations,
            'transport' => $case->transport,
        ];
    }
}
