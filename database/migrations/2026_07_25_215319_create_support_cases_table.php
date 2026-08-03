<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('support_cases', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->date('reported_date');
            $table->time('reported_time');
            $table->time('resolved_time')->nullable();

            $table->string('shift', 2);
            $table->string('reporter')->nullable();
            $table->string('driver')->nullable();
            $table->string('case_type');
            $table->text('description');
            $table->string('status');
            $table->text('observations')->nullable();
            $table->string('transport')->nullable();

            $table->timestamps();

            $table->index('reported_date');
            $table->index('case_type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_cases');
    }
};
