<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 180);
            $table->string('category', 100)->nullable()->index();
            $table->string('summary', 500)->nullable();
            $table->longText('content');
            $table->timestamps();

            $table->index(['created_at', 'title']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guides');
    }
};
