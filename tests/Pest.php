<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function validSupportCase(array $overrides = []): array
{
    return array_merge([
        'reported_date' => '2026-07-25',
        'reported_time' => '09:15',
        'resolved_time' => '09:45',
        'shift' => 'AM',
        'reporter' => 'Silvana Alvarez',
        'driver' => 'Juan Perez',
        'center' => 'Centro Norte',
        'case_type' => 'Aplicación móvil',
        'description' => 'Portal se cierra.',
        'status' => 'Resuelto',
        'observations' => 'Se borraron datos y cache.',
        'transport' => '5791716',
    ], $overrides);
}
