<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('technician')->after('email');
            $table->index('role');
        });

        $now = now();
        DB::table('support_cases')
            ->whereNotNull('driver')
            ->where('driver', '!=', '')
            ->distinct()
            ->pluck('driver')
            ->each(fn (string $name) => DB::table('support_options')->insertOrIgnore([
                'category' => 'driver',
                'name' => $name,
                'active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]));
    }

    public function down(): void
    {
        DB::table('support_options')->where('category', 'driver')->delete();
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropColumn('role');
        });
    }
};
