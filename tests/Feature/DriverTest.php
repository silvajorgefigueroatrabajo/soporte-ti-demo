<?php

use App\Models\Driver;
use App\Models\SupportCase;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

it('imports and displays drivers with email passwords encrypted at rest', function () {
    $user = User::factory()->create();
    $contents = "Cód Centro\tCentro\tConductor\tNumero de serie POS\tTipo chip\tCOD SAP\tRUT\tUsuarios nuevos\tCorreo\tEmpresa\tClave Email\tUSER BTP\tOBSERVACIONES\tFecha solicitud\tGO LIVE\n".
        "D001\tCentro Demo\tOPERADOR DEMO\tDEMO-POS-001\teSIM\tDEMO-001\tDEMO-1\toperador_demo\toperador@example.com\tLogística Horizonte\tSECRETA\tSI\tSin observaciones\t\t21/01/2026";
    $file = UploadedFile::fake()->createWithContent('conductores.tsv', $contents);

    $this->actingAs($user)->post(route('drivers.import'), ['file' => $file])->assertRedirect();
    $this->actingAs($user)->get(route('drivers.index'))->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('drivers/index')->has('drivers.data', 1)->where('drivers.total', 1)->where('canManage', true));

    $this->assertDatabaseHas('drivers', ['center_code' => 'D001', 'name' => 'OPERADOR DEMO', 'pos_serial' => 'DEMO-POS-001']);
    $driver = Driver::query()->where('pos_serial', 'DEMO-POS-001')->firstOrFail();
    expect($driver->email_password)->toBe('SECRETA');
    expect(DB::table('drivers')->where('id', $driver->id)->value('email_password'))->not->toBe('SECRETA');
});
it('allows technicians to manage drivers and synchronizes names with support cases', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('drivers.store'), [
        'center_code' => '999', 'center_name' => 'Centro Prueba', 'name' => 'Conductor Prueba',
        'pos_serial' => 'POS999', 'chip_type' => 'Operador móvil', 'rut' => '1-9', 'email' => 'prueba@example.com', 'btp_user' => 'SI',
    ])->assertRedirect();
    $driver = Driver::query()->where('name', 'Conductor Prueba')->firstOrFail();
    $this->assertDatabaseHas('support_options', ['category' => 'driver', 'name' => 'Conductor Prueba']);

    $case = SupportCase::query()->create([
        'user_id' => $user->id, 'reported_date' => '2026-07-27', 'reported_time' => '10:00', 'shift' => 'AM',
        'technician' => $user->name, 'reporter' => 'Comunicador', 'driver' => 'Conductor Prueba',
        'case_type' => 'Sincronización', 'description' => 'Prueba', 'status' => 'Resuelto',
    ]);
    $this->actingAs($user)->put(route('drivers.update', $driver), [
        'name' => 'Conductor Renombrado', 'center_code' => '999', 'center_name' => 'Centro Prueba', 'btp_user' => 'NO',
    ])->assertRedirect();
    expect($case->fresh()->driver)->toBe('Conductor Renombrado');

    $this->actingAs($user)->delete(route('drivers.destroy', $driver))->assertRedirect();
    $this->assertDatabaseMissing('drivers', ['id' => $driver->id]);
    expect($case->fresh()->driver)->toBe('Conductor Renombrado');
});

it('blocks observers from sensitive driver data', function () {
    $observer = User::factory()->create(['role' => 'observer']);
    $driver = Driver::query()->create(['name' => 'Conductor Solo Lectura']);
    $this->actingAs($observer)->get(route('drivers.index'))->assertForbidden();
    $this->actingAs($observer)->post(route('drivers.store'), [])->assertForbidden();
    $this->actingAs($observer)->put(route('drivers.update', $driver), [])->assertForbidden();
    $this->actingAs($observer)->delete(route('drivers.destroy', $driver))->assertForbidden();
});
it('generates secure pagination links behind the Render proxy', function () {
    $user = User::factory()->create();
    foreach (range(1, 26) as $index) {
        Driver::query()->create(['name' => "Conductor {$index}"]);
    }

    $this->actingAs($user)
        ->withServerVariables([
            'REMOTE_ADDR' => '10.0.0.1',
            'HTTP_X_FORWARDED_HOST' => 'demo.example.com',
            'HTTP_X_FORWARDED_PORT' => '443',
            'HTTP_X_FORWARDED_PROTO' => 'https',
        ])
        ->get('http://demo.example.com/drivers')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('drivers.next_page_url', 'https://demo.example.com/drivers?page=2'));
});
it('gives the demo observer read-only access', function () {
    $observer = User::factory()->create([
        'email' => 'demo@demo.example.com', 'role' => 'observer', 'password' => Hash::make('Demo2026!'),
    ]);

    expect($observer->role)->toBe('observer')
        ->and(Hash::check('Demo2026!', $observer->password))->toBeTrue();

    $this->actingAs($observer)->get(route('drivers.index'))->assertForbidden();
    $this->actingAs($observer)->get(route('centers.index'))->assertOk();
    $this->actingAs($observer)->get(route('support-cases.index'))->assertOk();
});
