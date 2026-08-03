<?php

namespace App\Http\Controllers;

use App\Models\Guide;
use App\Models\GuideImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GuideController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
        ]);

        $guides = Guide::query()
            ->with('user:id,name')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('summary', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($filters['category'] ?? null, fn ($query, string $category) => $query->where('category', $category))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Guide $guide) => $this->serialize($guide, $request));

        return Inertia::render('guides/index', [
            'guides' => $guides,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category' => $filters['category'] ?? '',
            ],
            'categories' => $this->categories(),
            'canCreate' => $request->user()->role === 'technician',
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorizeTechnician($request);

        return Inertia::render('guides/create', [
            'categories' => $this->categories(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeTechnician($request);
        $validated = $this->validateGuide($request);
        $files = $validated['screenshots'] ?? [];
        unset($validated['screenshots']);

        $guide = DB::transaction(function () use ($request, $validated, $files) {
            $guide = $request->user()->guides()->create($validated);
            $this->syncImages($guide, $files);

            return $guide;
        });

        return to_route('guides.show', $guide)->with('toast', [
            'type' => 'success', 'message' => 'Guía publicada correctamente.',
        ]);
    }

    public function show(Request $request, Guide $guide): Response
    {
        $guide->load(['user:id,name', 'images:id,guide_id,original_name,mime_type,size']);

        return Inertia::render('guides/show', [
            'guide' => $this->serialize($guide, $request, true),
        ]);
    }

    public function edit(Request $request, Guide $guide): Response
    {
        $this->authorizeOwner($request, $guide);
        $guide->load('images:id,guide_id,original_name,mime_type,size');

        return Inertia::render('guides/edit', [
            'guide' => $this->serialize($guide, $request, true),
            'categories' => $this->categories(),
        ]);
    }

    public function update(Request $request, Guide $guide): RedirectResponse
    {
        $this->authorizeOwner($request, $guide);
        $validated = $this->validateGuide($request);
        $files = $validated['screenshots'] ?? [];
        unset($validated['screenshots']);

        DB::transaction(function () use ($guide, $validated, $files) {
            $guide->update($validated);
            $this->syncImages($guide, $files);
        });

        return to_route('guides.show', $guide)->with('toast', [
            'type' => 'success', 'message' => 'Guía actualizada correctamente.',
        ]);
    }

    public function destroy(Request $request, Guide $guide): RedirectResponse
    {
        $this->authorizeOwner($request, $guide);
        $guide->delete();

        return to_route('guides.index')->with('toast', [
            'type' => 'success', 'message' => 'Guía eliminada correctamente.',
        ]);
    }

    /** @return array<string, mixed> */
    private function validateGuide(Request $request): array
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'category' => ['nullable', 'string', 'max:100'],
            'summary' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string', 'max:50000'],
            'screenshots' => ['nullable', 'array', 'max:20'],
            'screenshots.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        foreach (['title', 'category', 'summary', 'content'] as $field) {
            $value = $validated[$field] ?? null;
            $validated[$field] = is_string($value) && trim($value) !== '' ? trim($value) : null;
        }

        return $validated;
    }

    /** @param array<int, UploadedFile> $files */
    private function syncImages(Guide $guide, array $files): void
    {
        $content = $guide->content;
        preg_match_all('/\[\[captura:(\d+)\]\]/', $content, $matches);
        $requestedIds = collect($matches[1] ?? [])->map(fn ($id) => (int) $id)->unique();
        $ownedImages = $guide->images()->get()->keyBy('id');
        $keptIds = $requestedIds->filter(fn (int $id) => $ownedImages->has($id))->values();

        if ($keptIds->count() + count($files) > 20) {
            throw ValidationException::withMessages([
                'screenshots' => 'Una guía puede tener como máximo 20 capturas.',
            ]);
        }

        $allowedIds = $keptIds->all();
        foreach ($files as $index => $file) {
            $image = $guide->images()->create([
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType() ?: $file->getClientMimeType(),
                'size' => (int) $file->getSize(),
                'encoding' => 'base64',
                'data' => base64_encode($file->get()),
            ]);
            $content = str_replace("[[nueva-captura:{$index}]]", "[[captura:{$image->id}]]", $content);
            $allowedIds[] = $image->id;
        }

        $content = preg_replace('/\[\[nueva-captura:\d+\]\]/', '', $content) ?? $content;
        $content = preg_replace_callback(
            '/\[\[captura:(\d+)\]\]/',
            fn (array $match) => in_array((int) $match[1], $allowedIds, true) ? $match[0] : '',
            $content,
        ) ?? $content;

        preg_match_all('/\[\[captura:(\d+)\]\]/', $content, $finalMatches);
        $referencedIds = collect($finalMatches[1] ?? [])->map(fn ($id) => (int) $id)->unique()->all();
        $unusedImages = $guide->images();
        if ($referencedIds !== []) {
            $unusedImages->whereNotIn('id', $referencedIds);
        }
        $unusedImages->delete();

        $guide->update(['content' => trim($content)]);
    }

    /** @return array<int, array<string, mixed>> */
    private function contentBlocks(Guide $guide): array
    {
        $images = $guide->images->keyBy('id');
        $parts = preg_split('/(\[\[captura:\d+\]\])/', $guide->content, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY) ?: [];

        return collect($parts)->map(function (string $part) use ($images) {
            if (preg_match('/^\[\[captura:(\d+)\]\]$/', $part, $match)) {
                $image = $images->get((int) $match[1]);

                return $image ? [
                    'type' => 'image',
                    'id' => $image->id,
                    'name' => $image->original_name,
                    'url' => route('guide-images.show', $image),
                ] : null;
            }

            return ['type' => 'text', 'content' => $part];
        })->filter()->values()->all();
    }

    private function authorizeTechnician(Request $request): void
    {
        abort_unless($request->user()->role === 'technician', 403);
    }

    private function authorizeOwner(Request $request, Guide $guide): void
    {
        abort_unless(
            $request->user()->role === 'technician' && $guide->user_id === $request->user()->id,
            403,
        );
    }

    /** @return array<int, string> */
    private function categories(): array
    {
        return Guide::query()->whereNotNull('category')->distinct()->orderBy('category')->pluck('category')->all();
    }

    /** @return array<string, mixed> */
    private function serialize(Guide $guide, Request $request, bool $includeContent = false): array
    {
        return [
            'id' => $guide->id,
            'title' => $guide->title,
            'category' => $guide->category,
            'summary' => $guide->summary ?: Str::limit(preg_replace('/\\[\\[captura:\\d+\\]\\]/', '', $guide->content) ?? $guide->content, 220),
            'content' => $includeContent ? $guide->content : null,
            'images' => $includeContent ? $guide->images->map(fn (GuideImage $image) => [
                'id' => $image->id,
                'name' => $image->original_name,
                'url' => route('guide-images.show', $image),
            ])->values() : [],
            'blocks' => $includeContent ? $this->contentBlocks($guide) : [],
            'author' => $guide->user?->name ?? 'Usuario eliminado',
            'created_at' => $guide->created_at?->format('d-m-Y H:i'),
            'updated_at' => $guide->updated_at?->format('d-m-Y H:i'),
            'can_manage' => $request->user()->role === 'technician' && $guide->user_id === $request->user()->id,
        ];
    }
}
