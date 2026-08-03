<?php

use App\Models\SupportCase;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function validSupportCase(array $overrides = []): array
{
    return array_merge([
        'reported_date' => '2026-07-25',
        'reported_time' => '09:15',
        'resolved_time' => '09:45',
        'shift' => 'AM',
        'reporter' => 'Silvana Alvarez',
        'driver' => 'Juan Perez',
        'center' => 'Centro Norte',
        'case_type' => 'Aplicación móvil',
        'description' => 'Portal se cierra.',
        'status' => 'Resuelto',
        'observations' => 'Se borraron datos y cache.',
        'transport' => '5791716',
    ], $overrides);
}

it('uses the authenticated user as technician even when a different value is submitted', function () {
    $user = User::factory()->create(['name' => 'Tecnico en sesion', 'shift' => 'AM']);
    $response = $this->actingAs($user)->post(route('support-cases.store'), [
        ...validSupportCase(),
        'technician' => 'Otro tecnico',
        'shift' => 'PM',
    ]);

    $response->assertRedirect(route('support-cases.index'))
        ->assertSessionHas('toast.message', 'Caso registrado correctamente.');
    $this->assertDatabaseHas('support_cases', [
        'user_id' => $user->id,
        'technician' => 'Tecnico en sesion',
        'case_type' => 'Aplicación móvil',
        'shift' => 'AM',
    ]);
    $this->assertDatabaseMissing('support_cases', ['technician' => 'Otro tecnico']);
});

it('stores reusable options but keeps transports unique to each case', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('support-cases.store'), validSupportCase([
        'reporter' => 'Nuevo Comunicador',
        'case_type' => 'Nuevo Tipo',
        'center' => 'Nuevo Centro',
        'transport' => 'Nuevo Transporte',
    ]))->assertRedirect(route('support-cases.index'));

    $this->assertDatabaseHas('support_options', ['category' => 'reporter', 'name' => 'Nuevo Comunicador', 'active' => true]);
    $this->assertDatabaseHas('support_options', ['category' => 'case_type', 'name' => 'Nuevo Tipo', 'active' => true]);
    $this->assertDatabaseHas('support_options', ['category' => 'center', 'name' => 'Nuevo Centro', 'active' => true]);
    $this->assertDatabaseMissing('support_options', ['category' => 'transport', 'name' => 'Nuevo Transporte']);

    $this->actingAs($user)->get(route('support-cases.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('technician', $user->name)
            ->where('options.reporters', fn ($values) => collect($values)->contains('Nuevo Comunicador'))
            ->where('options.case_types', fn ($values) => collect($values)->contains('Nuevo Tipo'))
            ->where('options.centers', fn ($values) => collect($values)->contains('Nuevo Centro')));
});

it('validates required fields and fixed parameter lists', function () {
    $response = $this->actingAs(User::factory()->create(['shift' => null]))
        ->from(route('support-cases.create'))
        ->post(route('support-cases.store'), [
            'reported_date' => 'invalid',
            'shift' => 'NOCHE',
            'status' => 'Pendiente',
        ]);

    $response->assertRedirect(route('support-cases.create'))
        ->assertSessionHasErrors(['reported_date', 'reported_time', 'reporter', 'case_type', 'description', 'status']);
    expect(SupportCase::count())->toBe(0);
});

it('requires technicians to configure a shift before registering cases', function () {
    $user = User::factory()->create(['shift' => null]);

    $this->actingAs($user)
        ->from(route('support-cases.create'))
        ->post(route('support-cases.store'), validSupportCase())
        ->assertSessionHasErrors('shift')
        ->assertRedirect(route('support-cases.create'));

    expect(SupportCase::count())->toBe(0);
});
it('provides dynamic options to the create form', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->get(route('support-cases.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('support-cases/create')
            ->where('technician', $user->name)
            ->where('shift', 'AM')
            ->missing('options.shifts')
            ->where('options.statuses', ['Resuelto', 'Escalado', 'Sin Respuesta'])
            ->has('options.case_types', 6)
            ->has('options.reporters', 4));
});

it('shows and filters the support case history', function () {
    $user = User::factory()->create();
    SupportCase::query()->create(['user_id' => $user->id, 'technician' => $user->name, ...validSupportCase(['status' => 'Escalado', 'description' => 'Solicitud de ruta.'])]);
    SupportCase::query()->create(['user_id' => $user->id, 'technician' => $user->name, ...validSupportCase(['reported_date' => '2026-07-24', 'status' => 'Resuelto', 'description' => 'Caso finalizado.'])]);

    $this->actingAs($user)
        ->get(route('support-cases.index', ['status' => 'Escalado', 'search' => 'ruta']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('support-cases/index')
            ->where('filters.status', 'Escalado')
            ->has('cases.data', 1)
            ->where('cases.data.0.technician', $user->name)
            ->where('cases.data.0.status', 'Escalado'));
});
it('combines history filters and preserves them in pagination links', function () {
    $user = User::factory()->create(['name' => 'Tecnico Buscable']);
    foreach (range(1, 16) as $index) {
        SupportCase::query()->create([
            'user_id' => $user->id,
            'technician' => $user->name,
            ...validSupportCase([
                'reported_date' => '2026-07-27',
                'status' => 'Escalado',
                'center' => 'Centro Centro Sur',
                'transport' => "5815{$index}",
                'description' => "Incidencia filtrable {$index}",
            ]),
        ]);
    }
    SupportCase::query()->create([
        'user_id' => $user->id,
        'technician' => $user->name,
        ...validSupportCase(['reported_date' => '2026-07-26', 'status' => 'Resuelto', 'center' => 'Otro Centro']),
    ]);

    $this->actingAs($user)
        ->get(route('support-cases.index', [
            'search' => 'Centro Centro Sur',
            'status' => 'Escalado',
            'date' => '2026-07-27',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('cases.total', 16)
            ->has('cases.data', 15)
            ->where('filters.search', 'Centro Centro Sur')
            ->where('filters.status', 'Escalado')
            ->where('filters.date', '2026-07-27')
            ->where('cases.next_page_url', fn ($url) => str_contains($url, 'page=2')
                && str_contains($url, 'search=Centro')
                && str_contains($url, 'status=Escalado')
                && str_contains($url, 'date=2026-07-27')));
});
it('stores a new driver as a reusable option', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('support-cases.store'), validSupportCase([
        'driver' => 'Nuevo Conductor',
    ]))->assertRedirect(route('support-cases.index'));

    $this->assertDatabaseHas('support_options', [
        'category' => 'driver',
        'name' => 'Nuevo Conductor',
        'active' => true,
    ]);

    $this->actingAs($user)->get(route('support-cases.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('options.drivers', fn ($values) => collect($values)->contains('Nuevo Conductor')));
});

it('allows a technician to update and delete only their own cases', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $ownedCase = SupportCase::query()->create([
        'user_id' => $owner->id,
        'technician' => $owner->name,
        ...validSupportCase(),
    ]);

    $this->actingAs($other)->get(route('support-cases.edit', $ownedCase))->assertForbidden();
    $this->actingAs($other)->put(route('support-cases.update', $ownedCase), validSupportCase())->assertForbidden();
    $this->actingAs($other)->delete(route('support-cases.destroy', $ownedCase))->assertForbidden();

    $this->actingAs($owner)->put(route('support-cases.update', $ownedCase), validSupportCase([
        'description' => 'Caso corregido.',
        'driver' => 'Conductor Editado',
    ]))->assertRedirect(route('support-cases.index'));
    $this->assertDatabaseHas('support_cases', ['id' => $ownedCase->id, 'description' => 'Caso corregido.']);

    $this->actingAs($owner)->delete(route('support-cases.destroy', $ownedCase))
        ->assertRedirect(route('support-cases.index'));
    $this->assertDatabaseMissing('support_cases', ['id' => $ownedCase->id]);
});

it('gives observers read-only access', function () {
    $observer = User::factory()->create(['role' => 'observer']);

    $this->actingAs($observer)->get(route('support-cases.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('canCreate', false));
    $this->actingAs($observer)->get(route('support-cases.create'))->assertForbidden();
    $this->actingAs($observer)->post(route('support-cases.store'), validSupportCase())->assertForbidden();
});

it('creates regular accounts as technicians by default', function () {
    $user = User::factory()->create();

    expect($user->role)->toBe('technician');
});

it('filters history by date range type and center without exposing technician filters', function () {
    $user = User::factory()->create(['name' => 'Tecnico Uno']);
    SupportCase::query()->create([
        'user_id' => $user->id,
        'technician' => 'Tecnico Uno',
        ...validSupportCase(['reported_date' => '2026-07-15', 'case_type' => 'Documentos', 'center' => 'Centro Sur']),
    ]);
    SupportCase::query()->create([
        'user_id' => $user->id,
        'technician' => 'Tecnico Dos',
        ...validSupportCase(['reported_date' => '2026-07-20', 'case_type' => 'Sincronización', 'center' => 'Centro Capital']),
    ]);

    $this->actingAs($user)->get(route('support-cases.index', [
        'date_from' => '2026-07-01',
        'date_to' => '2026-07-31',
        'type' => 'Documentos',
        'center' => 'Centro Sur',
    ]))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('cases.total', 1)
        ->where('cases.data.0.technician', 'Tecnico Uno')
        ->where('filters.date_from', '2026-07-01')
        ->where('filters.date_to', '2026-07-31')
        ->where('filters.type', 'Documentos')
        ->where('filters.center', 'Centro Sur')
        ->missing('filterOptions.technicians')
        ->where('filterOptions.types', fn ($values) => collect($values)->contains('Sincronización'))
        ->where('filterOptions.centers', fn ($values) => collect($values)->contains('Centro Capital')));
});

it('filters history by shift', function () {
    $user = User::factory()->create();
    SupportCase::query()->create([...validSupportCase(), 'user_id' => $user->id, 'technician' => $user->name, 'shift' => 'AM']);
    SupportCase::query()->create([...validSupportCase(), 'user_id' => $user->id, 'technician' => $user->name, 'shift' => 'PM']);

    $this->actingAs($user)->get(route('support-cases.index', ['shift' => 'PM']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('cases.total', 1)->where('cases.data.0.shift', 'PM')->where('filters.shift', 'PM'));
});
