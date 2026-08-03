<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportCase extends Model
{
    protected $fillable = [
        'user_id',
        'reported_date',
        'reported_time',
        'resolved_time',
        'shift',
        'technician',
        'reporter',
        'driver',
        'center',
        'case_type',
        'description',
        'status',
        'observations',
        'transport',
    ];

    protected function casts(): array
    {
        return [
            'reported_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
