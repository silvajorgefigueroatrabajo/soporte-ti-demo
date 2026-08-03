<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuideImage extends Model
{
    protected $fillable = [
        'original_name',
        'mime_type',
        'size',
        'encoding',
        'data',
    ];

    protected $hidden = ['data'];

    /** @return BelongsTo<Guide, $this> */
    public function guide(): BelongsTo
    {
        return $this->belongsTo(Guide::class);
    }
}
