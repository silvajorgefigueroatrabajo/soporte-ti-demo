<?php

namespace App\Http\Controllers;

use App\Models\Center;
use App\Models\SupportCase;
use App\Models\SupportOption;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CenterController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:100']]);

        $centers = Center::query()
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('type', 'like', "%{$search}%")
                        ->orWhere('responsible', 'like', "%{$search}%")
                        ->orWhere('focal_point', 'like', "%{$search}%");
                });
            })
            ->orderByRaw('CASE WHEN code IS NULL THEN 1 ELSE 0 END')
            ->orderBy('name')
            ->get()
            ->map(fn (Center $center) => $this->serialize($center));

        return Inertia::render('centers/index', [
            'centers' => $centers,
            'filters' => ['search' => $filters['search'] ?? ''],
            'canManage' => $request->user()->role === 'technician',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeTechnician($request);
        $validated = $this->validateCenter($request);

        DB::transaction(function () use ($validated) {
            Center::query()->create($validated);
            SupportOption::query()->updateOrCreate(
                ['category' => 'center', 'name' => $validated['name']],
                ['active' => true],
            );
        });

        return back()->with('toast', ['type' => 'success', 'message' => 'Centro agregado correctamente.']);
    }

    public function update(Request $request, Center $center): RedirectResponse
    {
        $this->authorizeTechnician($request);
        $validated = $this->validateCenter($request, $center);
        $oldName = $center->name;

        DB::transaction(function () use ($center, $validated, $oldName) {
            $center->update($validated);
            SupportOption::query()->updateOrCreate(
                ['category' => 'center', 'name' => $validated['name']],
                ['active' => true],
            );

            if ($oldName !== $validated['name']) {
                SupportCase::query()->where('center', $oldName)->update(['center' => $validated['name']]);
                SupportOption::query()->where('category', 'center')->where('name', $oldName)->delete();
            }
        });

        return back()->with('toast', ['type' => 'success', 'message' => 'Centro actualizado correctamente.']);
    }

    public function destroy(Request $request, Center $center): RedirectResponse
    {
        $this->authorizeTechnician($request);

        DB::transaction(function () use ($center) {
            SupportOption::query()->where('category', 'center')->where('name', $center->name)->delete();
            $center->delete();
        });

        return back()->with('toast', ['type' => 'success', 'message' => 'Centro eliminado. Los casos históricos se conservaron.']);
    }

    private function validateCenter(Request $request, ?Center $center = null): array
    {
        $validated = $request->validate([
            'code' => ['nullable', 'string', 'max:30', Rule::unique('centers', 'code')->ignore($center)],
            'name' => ['required', 'string', 'max:255', Rule::unique('centers', 'name')->ignore($center)],
            'type' => ['nullable', 'string', 'max:255'],
            'responsible' => ['nullable', 'string', 'max:255'],
            'focal_point' => ['nullable', 'string', 'max:255'],
            'pos_status' => ['required', Rule::in(['SI', 'NO', 'N/A'])],
            'go_live_date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        foreach (['code', 'name', 'type', 'responsible', 'focal_point'] as $field) {
            $validated[$field] = isset($validated[$field]) && trim($validated[$field]) !== ''
                ? trim($validated[$field])
                : null;
        }

        return $validated;
    }

    private function authorizeTechnician(Request $request): void
    {
        abort_unless($request->user()->role === 'technician', 403);
    }

    private function serialize(Center $center): array
    {
        return [
            'id' => $center->id,
            'code' => $center->code,
            'name' => $center->name,
            'type' => $center->type,
            'responsible' => $center->responsible,
            'focal_point' => $center->focal_point,
            'pos_status' => $center->pos_status,
            'go_live_date' => $center->go_live_date?->format('Y-m-d'),
        ];
    }
}
