<?php

use App\Models\SupportCase;
use App\Models\SupportOption;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('support_cases', function (Blueprint $table) {
            $table->string('center')->nullable()->after('technician');
        });

        SupportCase::query()->whereNotNull('transport')->where('transport', '!=', '')
            ->pluck('transport')->unique()->each(fn (string $transport) => SupportOption::query()->firstOrCreate(['category' => 'transport', 'name' => trim($transport)])
            );
    }

    public function down(): void
    {
        SupportOption::query()->whereIn('category', ['center', 'transport'])->delete();

        Schema::table('support_cases', function (Blueprint $table) {
            $table->dropColumn('center');
        });
    }
};
