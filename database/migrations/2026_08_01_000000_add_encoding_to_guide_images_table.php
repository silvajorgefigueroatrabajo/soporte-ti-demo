<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guide_images', function (Blueprint $table) {
            $table->string('encoding', 20)->default('raw')->after('size');
        });
    }

    public function down(): void
    {
        Schema::table('guide_images', function (Blueprint $table) {
            $table->dropColumn('encoding');
        });
    }
};
