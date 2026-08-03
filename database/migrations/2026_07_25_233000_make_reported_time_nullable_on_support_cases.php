<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('support_cases', function (Blueprint $table) {
            $table->time('reported_time')->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('support_cases')->whereNull('reported_time')->update(['reported_time' => '00:00:00']);
        Schema::table('support_cases', function (Blueprint $table) {
            $table->time('reported_time')->nullable(false)->change();
        });
    }
};
