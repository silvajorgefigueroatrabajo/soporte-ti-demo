<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->string('center_code', 30)->nullable()->index();
            $table->string('center_name')->nullable()->index();
            $table->string('name')->index();
            $table->string('pos_serial')->nullable()->index();
            $table->string('chip_type')->nullable();
            $table->string('sap_code')->nullable();
            $table->string('rut', 30)->nullable()->index();
            $table->string('username')->nullable();
            $table->string('email')->nullable();
            $table->string('company')->nullable();
            $table->string('btp_user', 20)->nullable();
            $table->text('observations')->nullable();
            $table->string('request_date')->nullable();
            $table->string('go_live')->nullable();
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
