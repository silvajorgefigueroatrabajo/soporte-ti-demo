<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\SupportCase;
use App\Models\SupportOption;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DriverController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeTechnician($request);
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:100']]);
        $drivers = Driver::query()
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    foreach (['center_code', 'center_name', 'name', 'pos_serial', 'sap_code', 'rut', 'username', 'email', 'company'] as $field) {
                        $query->orWhere($field, 'like', "%{$search}%");
                    }
                });
            })
            ->orderBy('center_name')->orderBy('name')
            ->paginate(25)->withQueryString()
            ->through(fn (Driver $driver) => $this->serialize($driver));

        return Inertia::render('drivers/index', [
            'drivers' => $drivers,
            'filters' => ['search' => $filters['search'] ?? ''],
            'canManage' => $request->user()->role === 'technician',
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $this->authorizeTechnician($request);
        $request->validate(['file' => ['required', 'file', 'max:5120']]);
        $lines = file($request->file('file')->getRealPath(), FILE_IGNORE_NEW_LINES);
        abort_unless($lines !== false && count($lines) > 1, 422, 'El archivo está vacío.');
        $headerColumns = str_getcsv((string) $lines[0], "\t");
        $hasPasswordColumn = count($headerColumns) >= 15;
        $imported = 0;

        foreach (array_chunk(array_slice($lines, 1), 40) as $chunk) {
            DB::transaction(function () use ($chunk, $hasPasswordColumn, &$imported) {
                foreach ($chunk as $line) {
                    if (trim($line) === '') {
                        continue;
                    }
                    $columns = array_pad(str_getcsv($line, "\t"), $hasPasswordColumn ? 15 : 14, '');
                    $value = fn (int $index) => trim(str_replace("\u{00A0}", ' ', $columns[$index] ?? '')) ?: null;
                    $offset = $hasPasswordColumn ? 1 : 0;
                    $data = [
                        'center_code' => $value(0), 'center_name' => $value(1), 'name' => $value(2),
                        'pos_serial' => $value(3), 'chip_type' => $value(4), 'sap_code' => $value(5),
                        'rut' => $value(6), 'username' => $value(7), 'email' => $value(8),
                        'company' => $value(9), 'email_password' => $hasPasswordColumn ? $value(10) : null,
                        'btp_user' => $value(10 + $offset), 'observations' => $value(11 + $offset),
                        'request_date' => $value(12 + $offset), 'go_live' => $value(13 + $offset),
                    ];
                    if ($data['name'] === null) {
                        continue;
                    }
                    Driver::query()->updateOrCreate([
                        'name' => $data['name'], 'pos_serial' => $data['pos_serial'], 'center_code' => $data['center_code'],
                    ], $data);
                    SupportOption::query()->updateOrCreate(['category' => 'driver', 'name' => $data['name']], ['active' => true]);
                    $imported++;
                }
            });
        }

        return back()->with('toast', ['type' => 'success', 'message' => "Importación completada: {$imported} filas procesadas."]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeTechnician($request);
        $validated = $this->validateDriver($request);
        DB::transaction(function () use ($validated) {
            Driver::query()->create($validated);
            SupportOption::query()->updateOrCreate(['category' => 'driver', 'name' => $validated['name']], ['active' => true]);
        });

        return back()->with('toast', ['type' => 'success', 'message' => 'Conductor agregado correctamente.']);
    }

    public function update(Request $request, Driver $driver): RedirectResponse
    {
        $this->authorizeTechnician($request);
        $validated = $this->validateDriver($request);
        $oldName = $driver->name;

        DB::transaction(function () use ($driver, $validated, $oldName) {
            $driver->update($validated);
            SupportOption::query()->updateOrCreate(['category' => 'driver', 'name' => $validated['name']], ['active' => true]);

            if ($oldName !== $validated['name'] && ! Driver::query()->whereKeyNot($driver->id)->where('name', $oldName)->exists()) {
                SupportCase::query()->where('driver', $oldName)->update(['driver' => $validated['name']]);
                SupportOption::query()->where('category', 'driver')->where('name', $oldName)->delete();
            }
        });

        return back()->with('toast', ['type' => 'success', 'message' => 'Conductor actualizado correctamente.']);
    }

    public function destroy(Request $request, Driver $driver): RedirectResponse
    {
        $this->authorizeTechnician($request);
        DB::transaction(function () use ($driver) {
            $name = $driver->name;
            $driver->delete();
            if (! Driver::query()->where('name', $name)->exists()) {
                SupportOption::query()->where('category', 'driver')->where('name', $name)->delete();
            }
        });

        return back()->with('toast', ['type' => 'success', 'message' => 'Conductor eliminado. Los casos históricos se conservaron.']);
    }

    private function validateDriver(Request $request): array
    {
        $validated = $request->validate([
            'center_code' => ['nullable', 'string', 'max:30'],
            'center_name' => ['nullable', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'pos_serial' => ['nullable', 'string', 'max:255'],
            'chip_type' => ['nullable', 'string', 'max:255'],
            'sap_code' => ['nullable', 'string', 'max:255'],
            'rut' => ['nullable', 'string', 'max:30'],
            'username' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'email_password' => ['nullable', 'string', 'max:255'],
            'btp_user' => ['nullable', Rule::in(['SI', 'NO', 'N/A', 'NN'])],
            'observations' => ['nullable', 'string', 'max:5000'],
            'request_date' => ['nullable', 'string', 'max:100'],
            'go_live' => ['nullable', 'string', 'max:100'],
        ]);

        foreach ($validated as $field => $value) {
            if (is_string($value)) {
                $validated[$field] = trim($value) === '' ? null : trim($value);
            }
        }

        return $validated;
    }

    private function serialize(Driver $driver): array
    {
        return [
            'id' => $driver->id, 'center_code' => $driver->center_code, 'center_name' => $driver->center_name,
            'name' => $driver->name, 'pos_serial' => $driver->pos_serial, 'chip_type' => $driver->chip_type,
            'sap_code' => $driver->sap_code, 'rut' => $driver->rut, 'username' => $driver->username,
            'email' => $driver->email, 'company' => $driver->company, 'email_password' => $driver->email_password,
            'btp_user' => $driver->btp_user, 'observations' => $driver->observations,
            'request_date' => $driver->request_date, 'go_live' => $driver->go_live,
        ];
    }

    private function authorizeTechnician(Request $request): void
    {
        abort_unless($request->user()->role === 'technician', 403);
    }
}
