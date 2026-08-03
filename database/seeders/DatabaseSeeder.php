<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Center;
use App\Models\Driver;
use App\Models\Guide;
use App\Models\SupportCase;
use App\Models\SupportOption;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        fake()->seed(20260803);

        $password = Hash::make('Demo2026!');
        $admin = User::query()->create([
            'name' => 'Alex Rivera', 'email' => 'admin@demo.example.com', 'password' => $password,
            'role' => 'technician', 'shift' => 'AM', 'is_admin' => true, 'active' => true, 'email_verified_at' => now(),
        ]);
        $technicians = collect([
            ['name' => 'Camila Soto', 'email' => 'tecnico@demo.example.com', 'shift' => 'AM'],
            ['name' => 'Diego Morales', 'email' => 'tecnico.pm@demo.example.com', 'shift' => 'PM'],
        ])->map(fn (array $person) => User::query()->create([
            ...$person, 'password' => $password, 'role' => 'technician', 'active' => true, 'email_verified_at' => now(),
        ]));
        User::query()->create([
            'name' => 'Visitante Demo', 'email' => 'demo@demo.example.com', 'password' => $password,
            'role' => 'observer', 'shift' => null, 'active' => true, 'email_verified_at' => now(),
        ]);

        $centers = collect([
            ['code' => 'CN-01', 'name' => 'Centro Norte', 'type' => 'Distribución'],
            ['code' => 'CC-02', 'name' => 'Centro Capital', 'type' => 'Operaciones'],
            ['code' => 'CS-03', 'name' => 'Centro Sur', 'type' => 'Distribución'],
            ['code' => 'CP-04', 'name' => 'Centro Pacífico', 'type' => 'Operaciones'],
        ])->map(fn (array $center, int $index) => Center::query()->create([
            ...$center, 'responsible' => ['Marina Vega', 'Tomás Reyes', 'Valentina Cruz', 'Nicolás Peña'][$index],
            'focal_point' => 'Mesa Operativa', 'pos_status' => 'SI', 'go_live_date' => now()->subMonths(12 - $index),
        ]));

        $drivers = collect();
        foreach (range(1, 24) as $index) {
            $center = $centers[($index - 1) % $centers->count()];
            $drivers->push(Driver::query()->create([
                'center_code' => $center->code, 'center_name' => $center->name,
                'name' => fake()->unique()->name(), 'pos_serial' => sprintf('DEMO-POS-%04d', $index),
                'chip_type' => $index % 2 === 0 ? 'eSIM' : 'SIM', 'sap_code' => sprintf('D%05d', $index),
                'rut' => sprintf('DEMO-%05d', $index), 'username' => "operador{$index}",
                'email' => "operador{$index}@example.com", 'company' => 'Logística Horizonte',
                'btp_user' => $index % 3 === 0 ? 'SI' : 'NO', 'request_date' => now()->subDays(120 - $index)->format('Y-m-d'),
                'go_live' => now()->subDays(90 - $index)->format('Y-m-d'),
            ]));
        }

        $types = config('support.case_types');
        $statuses = config('support.statuses');
        $reporters = config('support.reporters');
        foreach (['case_type' => $types, 'reporter' => $reporters] as $category => $values) {
            foreach ($values as $value) {
                SupportOption::query()->updateOrCreate(
                    ['category' => $category, 'name' => $value],
                    ['active' => true],
                );
            }
        }

        $descriptions = [
            'La aplicación no permite completar el inicio de sesión.',
            'El terminal no sincroniza los pedidos asignados.',
            'Se presenta intermitencia en la conexión durante la ruta.',
            'El documento solicitado no aparece disponible para descarga.',
            'La sesión se cierra al confirmar la operación.',
            'El dispositivo requiere actualización de parámetros.',
        ];
        $solutions = [
            'Se validaron credenciales y se restableció el acceso.',
            'Se forzó la sincronización y se confirmó la recepción de datos.',
            'Se actualizó la configuración de red y se verificó conectividad.',
            'Se regeneró el documento y quedó disponible correctamente.',
            'Se limpiaron datos temporales y se inició una nueva sesión.',
            'Caso derivado al equipo especialista con evidencia adjunta.',
        ];

        foreach (range(1, 140) as $index) {
            $user = $technicians[($index - 1) % $technicians->count()];
            $driver = $drivers[($index * 7) % $drivers->count()];
            $reportedAt = Carbon::today()->subDays(($index * 5) % 92)->setTime(7 + ($index % 12), ($index * 7) % 60);
            $status = $index % 11 === 0 ? $statuses[1] : ($index % 17 === 0 ? $statuses[2] : $statuses[0]);
            $minutes = 8 + (($index * 13) % 95);

            SupportCase::query()->create([
                'user_id' => $user->id, 'reported_date' => $reportedAt->toDateString(),
                'reported_time' => $reportedAt->format('H:i'),
                'resolved_time' => $status === 'Resuelto' ? $reportedAt->copy()->addMinutes($minutes)->format('H:i') : null,
                'shift' => $user->shift, 'technician' => $user->name,
                'reporter' => $reporters[$index % count($reporters)], 'driver' => $driver->name,
                'center' => $driver->center_name, 'case_type' => $types[$index % count($types)],
                'description' => $descriptions[$index % count($descriptions)], 'status' => $status,
                'observations' => $status === 'Sin Respuesta' ? 'Se realizaron dos intentos de contacto sin respuesta.' : $solutions[$index % count($solutions)],
                'transport' => sprintf('DEMO-%06d', 100000 + $index),
            ]);
        }

        collect([
            ['Primeros pasos para diagnosticar conectividad', 'Conectividad', 'Lista de verificaciones antes de escalar una incidencia de red.'],
            ['Cómo recuperar el acceso de un usuario', 'Accesos', 'Procedimiento seguro para validar identidad y restablecer credenciales.'],
            ['Validación de sincronización en terminales', 'Terminales', 'Comprobaciones recomendadas cuando faltan datos en el dispositivo.'],
        ])->each(fn (array $guide) => $admin->guides()->create([
            'title' => $guide[0], 'category' => $guide[1], 'summary' => $guide[2],
            'content' => $guide[2]."\n\n1. Confirmar el alcance del problema.\n2. Registrar la evidencia disponible.\n3. Ejecutar las validaciones indicadas.\n4. Documentar el resultado.",
        ]));

        ActivityLog::query()->create([
            'user_id' => $admin->id, 'action' => 'created', 'subject_type' => Guide::class,
            'subject_id' => 1, 'description' => 'Publicó una guía de diagnóstico para el equipo demo.',
        ]);
    }
}
