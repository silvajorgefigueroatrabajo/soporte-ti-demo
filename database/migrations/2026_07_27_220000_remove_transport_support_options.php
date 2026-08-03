<?php

use App\Models\SupportOption;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        SupportOption::query()->where('category', 'transport')->delete();
    }

    public function down(): void
    {
        // Transport numbers are unique per case and must not be rebuilt as options.
    }
};
