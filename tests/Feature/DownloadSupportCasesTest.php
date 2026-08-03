<?php

use App\Http\Controllers\DownloadSupportCasesController;
use App\Models\Center;
use App\Models\Driver;
use App\Models\Guide;
use App\Models\SupportCase;
use App\Models\User;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

it('builds a lightweight continuity workbook with cases and operational directories', function () {
    $user = User::factory()->create(['name' => 'Diego Demo']);
    Center::query()->create(['code' => '9999', 'name' => 'Centro Norte', 'type' => 'Planta']);
    Driver::query()->create([
        'center_code' => '9999',
        'center_name' => 'Centro Norte',
        'name' => 'Juan Perez',
        'email' => 'juan@example.test',
        'email_password' => 'secreto-que-no-se-exporta',
    ]);
    Guide::query()->create([
        'user_id' => $user->id,
        'title' => 'Limpiar caché Portal',
        'category' => 'Portal',
        'summary' => 'Recuperar acceso.',
        'content' => "1. Abrir ajustes\n2. Limpiar caché",
    ]);
    SupportCase::query()->create([
        'user_id' => $user->id,
        'reported_date' => '2026-07-25',
        'reported_time' => '09:15',
        'resolved_time' => '09:45',
        'shift' => 'AM',
        'technician' => 'Diego Demo',
        'reporter' => 'Silvana Alvarez',
        'driver' => 'Juan Perez',
        'center' => 'Centro Norte',
        'case_type' => 'Aplicación móvil',
        'description' => 'Portal se cierra.',
        'status' => 'Resuelto',
        'observations' => 'Se limpió caché.',
        'transport' => '5791716',
    ]);

    $workbook = app(DownloadSupportCasesController::class)->buildWorkbook(SupportCase::with('user')->get());

    expect($workbook)->toBeInstanceOf(Spreadsheet::class)
        ->and($workbook->getSheetNames())->toBe(['Inicio', 'Dashboard', 'Casos', 'Centros', 'Conductores', 'Guías', 'Parámetros'])
        ->and($workbook->getSheetByName('Casos')->getCell('A1')->getValue())->toBe('Fecha')
        ->and($workbook->getSheetByName('Casos')->getCell('F2')->getValue())->toBe('Diego Demo')
        ->and($workbook->getSheetByName('Casos')->getCell('G2')->getValue())->toBe('Centro Norte')
        ->and($workbook->getSheetByName('Casos')->getCell('N1')->getValue())->toBe('Transporte')
        ->and($workbook->getSheetByName('Casos')->getTableCollection())->toHaveCount(1)
        ->and($workbook->getSheetByName('Dashboard')->getCell('A1')->getValue())->toBe('DASHBOARD SOPORTE TI')
        ->and($workbook->getSheetByName('Dashboard')->getCell('D11')->getValue())->toBe('Aplicación móvil')
        ->and($workbook->getSheetByName('Dashboard')->getChartCollection())->toHaveCount(2)
        ->and(collect($workbook->getSheetByName('Centros')->toArray())->flatten()->contains('Centro Norte'))->toBeTrue()
        ->and($workbook->getSheetByName('Conductores')->getCell('C2')->getValue())->toBe('Juan Perez')
        ->and($workbook->getSheetByName('Guías')->getCell('A2')->getValue())->toBe('Limpiar caché Portal');

    foreach ($workbook->getWorksheetIterator() as $sheet) {
        expect(collect($sheet->toArray(null, false))->flatten()->filter()->contains('secreto-que-no-se-exporta'))->toBeFalse();
    }
});

it('keeps the generated backup compact without preformatting thousands of cells', function () {
    $user = User::factory()->create(['name' => 'Alex Demo']);
    foreach (range(1, 250) as $index) {
        SupportCase::query()->create([
            'user_id' => $user->id,
            'reported_date' => '2026-07-'.str_pad((string) (($index % 28) + 1), 2, '0', STR_PAD_LEFT),
            'reported_time' => '09:15',
            'shift' => 'PM',
            'technician' => 'Alex Demo',
            'reporter' => 'Comunicador '.$index,
            'driver' => 'Conductor '.$index,
            'center' => 'Centro '.($index % 10),
            'case_type' => 'Sincronización',
            'description' => 'Caso de prueba '.$index,
            'status' => 'Resuelto',
            'observations' => 'Solución documentada.',
            'transport' => (string) (5800000 + $index),
        ]);
    }

    $workbook = app(DownloadSupportCasesController::class)->buildWorkbook(SupportCase::with('user')->get());
    $path = tempnam(sys_get_temp_dir(), 'support-backup-').'.xlsx';
    $writer = new Xlsx($workbook);
    $writer->save($path);

    expect(filesize($path))->toBeLessThan(750_000);

    @unlink($path);
});

it('allows authenticated users to download the xlsx backup', function () {
    $response = $this->actingAs(User::factory()->create())->get(route('support-cases.download'));

    $response->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect($response->streamedContent())->toStartWith('PK');
});

it('protects the xlsx backup from guests', function () {
    $this->get(route('support-cases.download'))->assertRedirect(route('login'));
});

it('allows observer accounts to download the sanitized backup', function () {
    $observer = User::factory()->create(['role' => 'observer']);

    $response = $this->actingAs($observer)->get(route('support-cases.download'));

    $response->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect($response->streamedContent())->toStartWith('PK');
});
