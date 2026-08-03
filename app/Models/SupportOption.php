<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportOption extends Model
{
    protected $fillable = ['category', 'name', 'active'];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }
}
