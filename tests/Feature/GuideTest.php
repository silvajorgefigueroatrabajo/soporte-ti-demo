<?php

use App\Models\Guide;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;

function validGuide(array $overrides = []): array
{
    return array_merge([
        'title' => 'Recuperar pedidos pendientes en POS',
        'category' => 'Sincronización',
        'summary' => 'Procedimiento para reenviar pedidos que no llegaron.',
        'content' => "1. Revisar el transporte.\n2. Reinyectar el Sincronización.\n3. Validar en POS.",
    ], $overrides);
}

it('allows authenticated users to browse and read guides', function () {
    $author = User::factory()->create(['name' => 'Tecnico Autor']);
    $guide = $author->guides()->create(validGuide());
    $observer = User::factory()->create(['role' => 'observer']);

    $this->actingAs($observer)->get(route('guides.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('guides/index')
            ->where('canCreate', false)
            ->has('guides.data', 1)
            ->where('guides.data.0.title', $guide->title)
            ->where('guides.data.0.author', 'Tecnico Autor'));

    $this->actingAs($observer)->get(route('guides.show', $guide))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('guides/show')
            ->where('guide.content', $guide->content)
            ->where('guide.can_manage', false));
});

it('allows technicians to publish guides', function () {
    $technician = User::factory()->create();

    $response = $this->actingAs($technician)->post(route('guides.store'), validGuide());

    $guide = Guide::query()->firstOrFail();
    $response->assertRedirect(route('guides.show', $guide))
        ->assertSessionHas('toast.message', 'Guía publicada correctamente.');
    $this->assertDatabaseHas('guides', [
        'id' => $guide->id,
        'user_id' => $technician->id,
        'title' => 'Recuperar pedidos pendientes en POS',
        'category' => 'Sincronización',
    ]);
});

it('stores screenshots in the database and renders them between text blocks', function () {
    $technician = User::factory()->create();
    $screenshot = UploadedFile::fake()->image('monitor-operaciones.png', 900, 600)->size(200);
    $expectedImage = $screenshot->getContent();

    $this->actingAs($technician)->post(route('guides.store'), validGuide([
        'content' => "1. Abrir el monitor.\n\n[[nueva-captura:0]]\n\n2. Seleccionar el transporte.",
        'screenshots' => [$screenshot],
    ]))->assertRedirect();

    $guide = Guide::query()->firstOrFail();
    $image = $guide->images()->firstOrFail();

    expect($guide->content)->toContain("[[captura:{$image->id}]]")
        ->not->toContain('nueva-captura');
    $this->assertDatabaseHas('guide_images', [
        'guide_id' => $guide->id,
        'original_name' => 'monitor-operaciones.png',
        'mime_type' => 'image/png',
        'encoding' => 'base64',
    ]);

    $this->actingAs($technician)->get(route('guides.show', $guide))
        ->assertInertia(fn (Assert $page) => $page
            ->where('guide.blocks.0.type', 'text')
            ->where('guide.blocks.1.type', 'image')
            ->where('guide.blocks.1.id', $image->id)
            ->where('guide.blocks.2.type', 'text'));

    $imageResponse = $this->actingAs($technician)->get(route('guide-images.show', $image));
    $imageResponse->assertOk()->assertHeader('Content-Type', 'image/png');
    expect($imageResponse->getContent())->toBe($expectedImage);
});

it('removes a stored screenshot when its marker is deleted', function () {
    $technician = User::factory()->create();
    $this->actingAs($technician)->post(route('guides.store'), validGuide([
        'content' => 'Paso uno. [[nueva-captura:0]] Paso dos.',
        'screenshots' => [UploadedFile::fake()->image('paso.png')],
    ]));
    $guide = Guide::query()->firstOrFail();
    $image = $guide->images()->firstOrFail();

    $this->actingAs($technician)->put(route('guides.update', $guide), validGuide([
        'content' => 'Paso uno. Paso dos.',
    ]))->assertRedirect(route('guides.show', $guide));

    $this->assertDatabaseMissing('guide_images', ['id' => $image->id]);
});
it('validates guide fields', function () {
    $technician = User::factory()->create();

    $this->actingAs($technician)
        ->from(route('guides.create'))
        ->post(route('guides.store'), ['title' => '', 'content' => ''])
        ->assertRedirect(route('guides.create'))
        ->assertSessionHasErrors(['title', 'content']);

    expect(Guide::count())->toBe(0);
});

it('allows up to twenty optimized screenshots and rejects oversized uploads', function () {
    $technician = User::factory()->create();
    $screenshots = collect(range(1, 20))
        ->map(fn (int $number) => UploadedFile::fake()->image("paso-{$number}.webp")->size(100))
        ->all();
    $markers = collect(range(0, 19))
        ->map(fn (int $number) => "[[nueva-captura:{$number}]]")
        ->implode("\n");

    $this->actingAs($technician)->post(route('guides.store'), validGuide([
        'content' => "Procedimiento\n{$markers}",
        'screenshots' => $screenshots,
    ]))->assertRedirect();

    expect(Guide::query()->firstOrFail()->images()->count())->toBe(20);

    $this->actingAs($technician)->post(route('guides.store'), validGuide([
        'screenshots' => [UploadedFile::fake()->image('demasiado-grande.png')->size(2100)],
    ]))->assertSessionHasErrors('screenshots.0');
});

it('allows only the author to edit and delete a guide', function () {
    $author = User::factory()->create();
    $other = User::factory()->create();
    $guide = $author->guides()->create(validGuide());

    $this->actingAs($other)->get(route('guides.edit', $guide))->assertForbidden();
    $this->actingAs($other)->put(route('guides.update', $guide), validGuide())->assertForbidden();
    $this->actingAs($other)->delete(route('guides.destroy', $guide))->assertForbidden();

    $this->actingAs($author)->put(route('guides.update', $guide), validGuide([
        'title' => 'Guía actualizada',
        'category' => 'POS',
    ]))->assertRedirect(route('guides.show', $guide));
    $this->assertDatabaseHas('guides', ['id' => $guide->id, 'title' => 'Guía actualizada']);

    $this->actingAs($author)->delete(route('guides.destroy', $guide))
        ->assertRedirect(route('guides.index'));
    $this->assertDatabaseMissing('guides', ['id' => $guide->id]);
});

it('gives observers read-only access to guides', function () {
    $observer = User::factory()->create(['role' => 'observer']);

    $this->actingAs($observer)->get(route('guides.create'))->assertForbidden();
    $this->actingAs($observer)->post(route('guides.store'), validGuide())->assertForbidden();
});

it('filters guides by text and category', function () {
    $technician = User::factory()->create(['name' => 'Autor Buscable']);
    $technician->guides()->create(validGuide());
    $technician->guides()->create(validGuide([
        'title' => 'Limpiar caché de Portal',
        'category' => 'Portal',
        'content' => 'Procedimiento de limpieza.',
    ]));

    $this->actingAs($technician)->get(route('guides.index', [
        'search' => 'pedidos',
        'category' => 'Sincronización',
    ]))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('filters.search', 'pedidos')
        ->where('filters.category', 'Sincronización')
        ->has('guides.data', 1)
        ->where('guides.data.0.title', 'Recuperar pedidos pendientes en POS'));
});
