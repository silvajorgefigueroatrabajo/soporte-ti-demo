<?php

namespace App\Http\Controllers;

use App\Models\GuideImage;
use Illuminate\Http\Response;

class GuideImageController extends Controller
{
    public function __invoke(GuideImage $guideImage): Response
    {
        $data = is_resource($guideImage->data) ? stream_get_contents($guideImage->data) : $guideImage->data;
        if ($guideImage->encoding === 'base64') {
            $decoded = base64_decode($data, true);
            abort_if($decoded === false, 404);
            $data = $decoded;
        }

        return response($data, 200, [
            'Content-Type' => $guideImage->mime_type,
            'Content-Length' => (string) $guideImage->size,
            'Content-Disposition' => 'inline; filename=captura',
            'Cache-Control' => 'private, max-age=86400',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
