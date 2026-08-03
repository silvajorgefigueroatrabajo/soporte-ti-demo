<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_options', function (Blueprint $table) {
            $table->id();
            $table->string('category', 50);
            $table->string('name');
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->unique(['category', 'name']);
            $table->index(['category', 'active']);
        });

        $now = now();
        $rows = collect([
            'reporter' => config('support.reporters'),
            'case_type' => config('support.case_types'),
        ])->flatMap(fn (array $names, string $category) => collect($names)->map(fn (string $name) => [
            'category' => $category,
            'name' => $name,
            'active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]))->all();

        DB::table('support_options')->insert($rows);
    }

    public function down(): void
    {
        Schema::dropIfExists('support_options');
    }
};
