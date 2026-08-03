<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Center extends Model
{
    protected $fillable = [
        'code',
        'name',
        'type',
        'responsible',
        'focal_point',
        'pos_status',
        'go_live_date',
    ];

    protected function casts(): array
    {
        return ['go_live_date' => 'date'];
    }
}
