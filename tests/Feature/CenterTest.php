<?php

use App\Models\Center;
use App\Models\SupportCase;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the seeded center directory to authenticated users', function () {
    Center::query()->create([
        'code' => 'CN-01', 'name' => 'Centro Norte', 'type' => 'Distribución',
        'responsible' => 'Marina Vega', 'focal_point' => 'Mesa Operativa',
    ]);
    $this->actingAs(User::factory()->create())
        ->get(route('centers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('centers/index')
            ->has('centers', 1)
            ->where('canManage', true)
            ->where('centers.0.name', fn ($name) => is_string($name)));

    $this->assertDatabaseHas('centers', [
        'code' => 'CN-01',
        'name' => 'Centro Norte',
        'responsible' => 'Marina Vega',
        'focal_point' => 'Mesa Operativa',
    ]);
});

it('allows technicians to create update and delete centers while synchronizing case options', function () {
    $technician = User::factory()->create();

    $this->actingAs($technician)->post(route('centers.store'), [
        'code' => '999',
        'name' => 'Centro Prueba',
        'type' => 'Planta',
        'responsible' => 'Responsable Uno',
        'focal_point' => 'Focal Uno',
        'pos_status' => 'SI',
        'go_live_date' => '2026-08-01',
    ])->assertRedirect();

    $center = Center::query()->where('code', '999')->firstOrFail();
    $this->assertDatabaseHas('support_options', ['category' => 'center', 'name' => 'Centro Prueba']);

    $case = SupportCase::query()->create([
        'user_id' => $technician->id,
        'reported_date' => '2026-07-27',
        'reported_time' => '10:00',
        'shift' => 'AM',
        'technician' => $technician->name,
        'reporter' => 'Comunicador',
        'center' => 'Centro Prueba',
        'case_type' => 'Sincronización',
        'description' => 'Caso de prueba.',
        'status' => 'Resuelto',
    ]);

    $this->actingAs($technician)->put(route('centers.update', $center), [
        'code' => '999',
        'name' => 'Centro Renombrado',
        'type' => 'Centro Logístico',
        'responsible' => 'Responsable Dos',
        'focal_point' => 'Focal Dos',
        'pos_status' => 'NO',
        'go_live_date' => '',
    ])->assertRedirect();

    expect($case->fresh()->center)->toBe('Centro Renombrado');
    $this->assertDatabaseHas('support_options', ['category' => 'center', 'name' => 'Centro Renombrado']);
    $this->assertDatabaseMissing('support_options', ['category' => 'center', 'name' => 'Centro Prueba']);

    $this->actingAs($technician)->delete(route('centers.destroy', $center))->assertRedirect();
    $this->assertDatabaseMissing('centers', ['id' => $center->id]);
    $this->assertDatabaseMissing('support_options', ['category' => 'center', 'name' => 'Centro Renombrado']);
    expect($case->fresh()->center)->toBe('Centro Renombrado');
});

it('gives observers read-only access to centers', function () {
    $observer = User::factory()->create(['role' => 'observer']);
    $center = Center::query()->create(['code' => 'CD-01', 'name' => 'Centro Demo']);

    $this->actingAs($observer)->get(route('centers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('canManage', false));
    $this->actingAs($observer)->post(route('centers.store'), [])->assertForbidden();
    $this->actingAs($observer)->put(route('centers.update', $center), [])->assertForbidden();
    $this->actingAs($observer)->delete(route('centers.destroy', $center))->assertForbidden();
});

it('creates a pending center record when a new center is entered while registering a case', function () {
    $technician = User::factory()->create();

    $this->actingAs($technician)->post(route('support-cases.store'), validSupportCase([
        'center' => 'Centro Ingresado desde Caso',
    ]))->assertRedirect(route('support-cases.index'));

    $this->assertDatabaseHas('centers', [
        'name' => 'Centro Ingresado desde Caso',
        'code' => null,
    ]);
});
