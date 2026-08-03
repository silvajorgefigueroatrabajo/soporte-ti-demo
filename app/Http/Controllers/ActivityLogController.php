<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function __invoke(Request $request): Response
    {
        abort_unless($request->user()->is_admin === true, 403);
        $search = trim($request->string('search')->toString());
        $logs = ActivityLog::query()->with('user:id,name')
            ->when($search, fn ($query) => $query->where('description', 'like', "%{$search}%"))
            ->latest()->paginate(25)->withQueryString()->through(fn (ActivityLog $log) => [
                'id' => $log->id, 'user' => $log->user?->name ?? 'Sistema', 'action' => $log->action,
                'description' => $log->description, 'changes' => $log->changes,
                'created_at' => $log->created_at?->format('d-m-Y H:i'),
            ]);

        return Inertia::render('activity/index', ['logs' => $logs, 'filters' => ['search' => $search]]);
    }
}
