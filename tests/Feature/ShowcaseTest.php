<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('showcase requires authentication', function () {
    $this->get('/showcase')->assertRedirect(route('login'));
});

test('verified users can access the synthetic showcase', function () {
    $this->actingAs(User::factory()->create())
        ->get('/showcase')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('showcase'));
});
