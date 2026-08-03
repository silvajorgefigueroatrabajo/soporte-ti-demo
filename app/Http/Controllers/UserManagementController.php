<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeTechnician($request);

        return Inertia::render('users/index', ['users' => User::query()->orderBy('name')->get([
            'id', 'name', 'email', 'role', 'is_admin', 'shift', 'active', 'last_login_at',
        ]), 'roles' => ['technician', 'observer'], 'shifts' => config('support.shifts')]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeTechnician($request);
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'], 'role' => ['required', Rule::in(['technician', 'observer'])],
            'shift' => ['nullable', Rule::in(config('support.shifts'))]]);
        $user = User::query()->create([...$data, 'active' => true, 'email_verified_at' => now()]);
        ActivityLog::record('created', $user, "Creó la cuenta de {$user->name}");

        return back()->with('toast', ['type' => 'success', 'message' => 'Usuario creado correctamente.']);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorizeTechnician($request);
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', Rule::unique('users')->ignore($user)],
            'password' => ['nullable', 'string', 'min:8'], 'role' => ['required', Rule::in(['technician', 'observer'])],
            'shift' => ['nullable', Rule::in(config('support.shifts'))], 'active' => ['required', 'boolean']]);
        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }
        if ($request->user()->is($user) || $user->is_admin) {
            $data['active'] = true;
        }
        if ($user->is_admin) {
            $data['role'] = 'technician';
        }
        $before = $user->only(['name', 'email', 'role', 'shift', 'active']);
        $user->update($data);
        ActivityLog::record('updated', $user, "Actualizó la cuenta de {$user->name}", ['before' => $before, 'after' => $user->only(array_keys($before))]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Usuario actualizado correctamente.']);
    }

    private function authorizeTechnician(Request $request): void
    {
        abort_unless($request->user()->is_admin === true, 403);
    }
}
