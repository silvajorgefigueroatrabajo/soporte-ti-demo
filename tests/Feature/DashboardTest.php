<?php

use App\Models\SupportCase;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function dashboardCase(User $user, array $overrides = []): SupportCase
{
    return SupportCase::query()->create(array_merge([
        'user_id' => $user->id,
        'reported_date' => '2026-07-25',
        'reported_time' => '10:00',
        'shift' => 'AM',
        'technician' => 'Alex Demo',
        'reporter' => 'Autoatencion',
        'case_type' => 'Sincronización',
        'description' => 'Caso de soporte.',
        'status' => 'Resuelto',
    ], $overrides));
}

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('dashboard reports monthly totals by status and type', function () {
    $user = User::factory()->create();
    dashboardCase($user);
    dashboardCase($user, ['status' => 'Escalado', 'case_type' => 'Documentos', 'technician' => 'Diego Demo', 'center' => 'Centro Sur']);
    dashboardCase($user, ['status' => 'Sin Respuesta', 'case_type' => 'Documentos', 'technician' => 'Diego Demo', 'center' => 'Centro Sur']);
    dashboardCase($user, ['reported_date' => '2026-08-01']);

    $this->actingAs($user)->get(route('dashboard', ['month' => '2026-07']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('selectedMonth', '2026-07')
            ->where('summary.total', 3)
            ->where('summary.resolved', 1)
            ->where('summary.escalated', 1)
            ->where('summary.unanswered', 1)
            ->where('summary.resolutionRate', 33)
            ->has('byStatus', 3)
            ->has('byType', 2)
            ->missing('byTechnician')
            ->has('byCenter', 2)
            ->has('byDay', 1));
});

test('dashboard explorer builds custom metrics without technician dimensions', function () {
    $user = User::factory()->create();
    dashboardCase($user, ['center' => 'Centro Sur', 'case_type' => 'Sincronización', 'reported_time' => '10:00', 'resolved_time' => '10:20']);
    dashboardCase($user, ['center' => 'Centro Sur', 'case_type' => 'Documentos', 'reported_time' => '11:00', 'resolved_time' => '12:00']);

    $this->actingAs($user)->get(route('dashboard', [
        'month' => '2026-07', 'explorer_from' => '2026-07-01', 'explorer_to' => '2026-07-31',
        'explorer_center' => 'Centro Sur', 'explorer_group' => 'center', 'explorer_metric' => 'average_time',
        'explorer_chart' => 'table',
    ]))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('explorer.filters.group', 'center')
        ->where('explorer.filters.metric', 'average_time')
        ->where('explorer.filters.chart', 'table')
        ->where('explorer.data.0.label', 'Centro Sur')
        ->where('explorer.data.0.value', 40)
        ->missing('explorer.options.technicians'));
});
