<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = ['user_id', 'action', 'subject_type', 'subject_id', 'description', 'changes'];

    protected function casts(): array
    {
        return ['changes' => 'array'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function record(string $action, Model $subject, string $description, ?array $changes = null): void
    {
        static::query()->create(['user_id' => auth()->id(), 'action' => $action, 'subject_type' => $subject::class,
            'subject_id' => $subject->getKey(), 'description' => $description, 'changes' => $changes]);
    }
}
