<?php

use App\Models\ActivityLog;
use App\Models\SupportCase;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function operationsCase(User $user, array $overrides = []): SupportCase
{
    return SupportCase::query()->create(array_merge([
        'user_id' => $user->id, 'reported_date' => '2026-07-20', 'reported_time' => '10:00',
        'resolved_time' => '10:20', 'shift' => 'AM', 'technician' => $user->name,
        'reporter' => 'Central', 'center' => 'Centro Sur', 'case_type' => 'Sincronización',
        'description' => 'Los pedidos no llegan correctamente a la POS', 'status' => 'Resuelto',
        'observations' => 'Se reinyecta el transporte y llegan los pedidos.',
    ], $overrides));
}

test('dashboard calculates operational timing metrics without technician rankings', function () {
    $user = User::factory()->create(['role' => 'technician']);
    operationsCase($user);
    operationsCase($user, ['reported_time' => '11:00', 'resolved_time' => '12:00']);

    $this->actingAs($user)->get(route('dashboard', ['month' => '2026-07']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.averageResolutionMinutes', 40)
        ->where('summary.within30Rate', 50)
        ->where('summary.timedCases', 2)
        ->missing('byTechnician'));
});

test('technicians receive similar case suggestions', function () {
    $user = User::factory()->create(['role' => 'technician']);
    $case = operationsCase($user);

    $this->actingAs($user)->getJson(route('support-cases.similar', ['type' => 'Sincronización', 'description' => 'pedidos no llegan']))
        ->assertOk()->assertJsonPath('0.id', $case->id)->assertJsonPath('0.status', 'Resuelto');
});

test('creating a support case writes an activity entry', function () {
    $user = User::factory()->create(['role' => 'technician', 'shift' => 'AM']);
    $this->actingAs($user)->post(route('support-cases.store'), [
        'reported_date' => '2026-07-31', 'reported_time' => '10:00', 'resolved_time' => '10:10',
        'reporter' => 'Central', 'driver' => '', 'center' => 'Centro Sur', 'case_type' => 'Sincronización',
        'description' => 'Caso para validar la bitácora', 'status' => 'Resuelto', 'observations' => '', 'transport' => '',
    ])->assertRedirect(route('support-cases.index'));
    expect(ActivityLog::query()->where('user_id', $user->id)->where('action', 'created')->exists())->toBeTrue();
});

test('only administrators can create and manage users', function () {
    $technician = User::factory()->create(['role' => 'technician', 'is_admin' => true]);
    $regularTechnician = User::factory()->create(['role' => 'technician', 'is_admin' => false]);
    $observer = User::factory()->create(['role' => 'observer']);
    $payload = ['name' => 'Nuevo Técnico', 'email' => 'nuevo@example.com', 'password' => 'Password.2026', 'role' => 'technician', 'shift' => 'PM'];

    $this->actingAs($technician)->post(route('users.store'), $payload)->assertRedirect();
    $created = User::query()->where('email', 'nuevo@example.com')->firstOrFail();
    expect($created->active)->toBeTrue()->and($created->shift)->toBe('PM');
    $this->actingAs($regularTechnician)->get(route('users.index'))->assertForbidden();
    $this->actingAs($observer)->get(route('users.index'))->assertForbidden();
});

test('observers cannot access sensitive or account configuration pages', function () {
    $observer = User::factory()->create(['role' => 'observer']);

    $this->actingAs($observer)->get(route('drivers.index'))->assertForbidden();
    $this->actingAs($observer)->get(route('activity.index'))->assertForbidden();
    $this->actingAs($observer)->get(route('profile.edit'))->assertForbidden();
    $this->actingAs($observer)->get(route('dashboard'))->assertOk();
    $this->actingAs($observer)->get(route('support-cases.index'))->assertOk();
    $this->actingAs($observer)->get(route('centers.index'))->assertOk();
    $this->actingAs($observer)->get(route('guides.index'))->assertOk();
});

test('inactive users cannot authenticate', function () {
    $user = User::factory()->create(['email' => 'inactive@example.com', 'password' => 'Password.2026', 'active' => false]);
    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'Password.2026'])->assertSessionHasErrors();
    $this->assertGuest();
});
