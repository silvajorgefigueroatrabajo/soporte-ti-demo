import { Form, Link } from '@inertiajs/react';
import { ArrowLeft, ImagePlus, LoaderCircle, Save, X } from 'lucide-react';
import type { ClipboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type GuideValues = {
    id?: number;
    title: string;
    category: string | null;
    summary: string | null;
    content: string;
    images?: Array<{ id: number; name: string; url: string }>;
};

type Props = {
    title: string;
    description: string;
    values: GuideValues;
    categories: string[];
    form: { action: string; method: 'post' };
    cancelHref: string;
};

const textAreaClass =
    'border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]';

const maxImageBytes = 2 * 1024 * 1024;

const canvasBlob = (canvas: HTMLCanvasElement, quality: number) =>
    new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/webp', quality),
    );

const optimizeScreenshot = async (file: File): Promise<File> => {
    if (file.size <= maxImageBytes) {
        return file;
    }

    const bitmap = await createImageBitmap(file);
    let best: Blob | null = null;
    const baseScale = Math.min(1, 1920 / bitmap.width, 1920 / bitmap.height);

    try {
        for (let attempt = 0; attempt < 4; attempt += 1) {
            const scale = baseScale * 0.85 ** attempt;
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(bitmap.width * scale));
            canvas.height = Math.max(1, Math.round(bitmap.height * scale));
            const context = canvas.getContext('2d');

            if (!context) {
                throw new Error('Canvas no disponible');
            }

            context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            best = await canvasBlob(canvas, 0.9 - attempt * 0.08);

            if (best && best.size <= maxImageBytes) {
                return new File(
                    [best],
                    file.name.replace(/\.[^.]+$/, '.webp'),
                    { type: 'image/webp' },
                );
            }
        }
    } finally {
        bitmap.close();
    }

    return best
        ? new File([best], file.name.replace(/\.[^.]+$/, '.webp'), {
              type: 'image/webp',
          })
        : file;
};

export default function GuideForm({
    title,
    description,
    values,
    categories,
    form,
    cancelHref,
}: Props) {
    const [content, setContent] = useState(values.content);
    const [newImages, setNewImages] = useState<
        Array<{ file: File; url: string }>
    >([]);
    const [imageError, setImageError] = useState<string | null>(null);
    const [optimizingImages, setOptimizingImages] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewUrls = useRef<string[]>([]);

    useEffect(() => () => previewUrls.current.forEach(URL.revokeObjectURL), []);

    const addScreenshots = async (files: File[]) => {
        setImageError(null);
        const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const validFiles = files.filter((file) =>
            supportedTypes.includes(file.type),
        );

        if (validFiles.length !== files.length) {
            setImageError(
                'Algunas capturas no se agregaron. Usa archivos JPG, PNG o WebP.',
            );
        }

        const available = Math.max(
            0,
            20 - (values.images?.length ?? 0) - newImages.length,
        );
        const candidates = validFiles.slice(0, available);

        if (validFiles.length > available) {
            setImageError('Una guía puede tener como máximo 20 capturas.');
        }

        if (candidates.length === 0) {
            return;
        }

        const textarea = textareaRef.current;
        const cursor = textarea?.selectionStart ?? content.length;
        setOptimizingImages(true);

        let accepted: File[] = [];

        try {
            const optimized = await Promise.all(
                candidates.map((file) => optimizeScreenshot(file)),
            );
            accepted = optimized.filter((file) => file.size <= maxImageBytes);
        } catch {
            setImageError(
                'No se pudo procesar una captura. Intenta pegarla nuevamente.',
            );
        } finally {
            setOptimizingImages(false);
        }

        if (accepted.length !== candidates.length) {
            setImageError(
                'Una captura siguió superando los 2 MB después de comprimirla.',
            );
        }

        if (accepted.length === 0) {
            return;
        }

        const start = newImages.length;
        const additions = accepted.map((file) => {
            const url = URL.createObjectURL(file);
            previewUrls.current.push(url);

            return { file, url };
        });
        const combined = [...newImages, ...additions];

        setNewImages(combined);

        if (fileInputRef.current && typeof DataTransfer !== 'undefined') {
            const transfer = new DataTransfer();
            combined.forEach(({ file }) => transfer.items.add(file));
            fileInputRef.current.files = transfer.files;
        }

        const markers = additions
            .map((_, position) => `[[nueva-captura:${start + position}]]`)
            .join('\n\n');
        const before = content.slice(0, cursor).replace(/\s*$/, '');
        const after = content.slice(cursor).replace(/^\s*/, '');
        const next = `${before}\n\n${markers}\n\n${after}`.trim();
        setContent(next);

        requestAnimationFrame(() => {
            textarea?.focus();
            const position = Math.min(
                next.length,
                before.length + markers.length + 4,
            );
            textarea?.setSelectionRange(position, position);
        });
    };

    const pasteScreenshots = (event: ClipboardEvent<HTMLTextAreaElement>) => {
        if (optimizingImages) {
            event.preventDefault();
            setImageError(
                'Espera a que termine de procesarse la captura anterior.',
            );

            return;
        }

        const clipboardImages = Array.from(event.clipboardData.items)
            .filter(
                (item) =>
                    item.kind === 'file' && item.type.startsWith('image/'),
            )
            .map((item, index) => {
                const image = item.getAsFile();

                if (!image) {
                    return null;
                }

                const extension =
                    image.type === 'image/jpeg'
                        ? 'jpg'
                        : image.type === 'image/webp'
                          ? 'webp'
                          : 'png';

                return new File(
                    [image],
                    `captura-${Date.now()}-${index + 1}.${extension}`,
                    { type: image.type || 'image/png' },
                );
            })
            .filter((image): image is File => image !== null);

        if (clipboardImages.length === 0) {
            return;
        }

        event.preventDefault();
        void addScreenshots(clipboardImages);
    };

    const clearNewScreenshots = () => {
        newImages.forEach(({ url }) => URL.revokeObjectURL(url));
        previewUrls.current = previewUrls.current.filter(
            (url) => !newImages.some((image) => image.url === url),
        );
        setNewImages([]);
        setContent((current) =>
            current.replace(/\s*\[\[nueva-captura:\d+\]\]\s*/g, '\n\n').trim(),
        );

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Card className="max-w-4xl">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form} className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2 md:col-span-2">
                                    <Label htmlFor="title">Título *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        defaultValue={values.title}
                                        maxLength={180}
                                        placeholder="Ej: Cómo recuperar pedidos que no llegan a POS"
                                        required
                                    />
                                    <InputError message={errors.title} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Categoría</Label>
                                    <Input
                                        id="category"
                                        name="category"
                                        list="guide-categories"
                                        defaultValue={values.category ?? ''}
                                        maxLength={100}
                                        placeholder="Ej: Portal, POS, Sincronización o Documentoss"
                                        autoComplete="off"
                                    />
                                    <datalist id="guide-categories">
                                        {categories.map((category) => (
                                            <option
                                                key={category}
                                                value={category}
                                            />
                                        ))}
                                    </datalist>
                                    <InputError message={errors.category} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="summary">
                                        Resumen breve
                                    </Label>
                                    <Input
                                        id="summary"
                                        name="summary"
                                        defaultValue={values.summary ?? ''}
                                        maxLength={500}
                                        placeholder="Qué problema resuelve esta guía"
                                    />
                                    <InputError message={errors.summary} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content">
                                    Procedimiento o solución *
                                </Label>
                                <textarea
                                    id="content"
                                    name="content"
                                    rows={18}
                                    ref={textareaRef}
                                    value={content}
                                    onChange={(event) =>
                                        setContent(event.target.value)
                                    }
                                    onPaste={pasteScreenshots}
                                    maxLength={50000}
                                    className={textAreaClass}
                                    placeholder={
                                        'Describe el contexto, las verificaciones y los pasos de solución.\n\n1. Primer paso\n2. Segundo paso\n3. Validación final'
                                    }
                                    required
                                />
                                <InputError message={errors.content} />
                                <p className="text-xs text-muted-foreground">
                                    Puedes usar párrafos y pasos numerados. El
                                    formato se conservará al publicar. También
                                    puedes pegar una captura con Ctrl + V en la
                                    posición del cursor.
                                </p>
                            </div>

                            <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <Label htmlFor="screenshots">
                                            Capturas dentro del procedimiento
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Pon el cursor donde quieras la
                                            imagen y pégala con Ctrl + V, o
                                            selecciónala desde un archivo.
                                            Máximo 20 capturas JPG, PNG o WebP
                                            de 2 MB; las imágenes grandes se
                                            comprimen automáticamente.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <label
                                            htmlFor="screenshots"
                                            className="cursor-pointer"
                                        >
                                            <ImagePlus />
                                            Insertar capturas
                                        </label>
                                    </Button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    id="screenshots"
                                    name="screenshots[]"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    disabled={optimizingImages}
                                    className="sr-only"
                                    onChange={(event) =>
                                        void addScreenshots(
                                            Array.from(
                                                event.target.files ?? [],
                                            ),
                                        )
                                    }
                                />
                                <InputError message={errors.screenshots} />
                                {optimizingImages && (
                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <LoaderCircle className="size-4 animate-spin" />
                                        Optimizando capturas…
                                    </p>
                                )}
                                {imageError && (
                                    <p className="text-sm text-destructive">
                                        {imageError}
                                    </p>
                                )}

                                {(values.images?.length ?? 0) > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium">
                                            Capturas publicadas
                                        </p>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {values.images?.map((image) => (
                                                <div
                                                    key={image.id}
                                                    className="overflow-hidden rounded-lg border bg-card"
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt={image.name}
                                                        className="h-28 w-full object-cover"
                                                    />
                                                    <div className="space-y-1 p-2 text-xs">
                                                        <p
                                                            className="truncate"
                                                            title={image.name}
                                                        >
                                                            {image.name}
                                                        </p>
                                                        <code className="text-muted-foreground">{`[[captura:${image.id}]]`}</code>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Para quitar una captura publicada,
                                            elimina su marcador del
                                            procedimiento.
                                        </p>
                                    </div>
                                )}

                                {newImages.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs font-medium">
                                                Capturas nuevas
                                            </p>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={clearNewScreenshots}
                                            >
                                                <X />
                                                Limpiar nuevas
                                            </Button>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {newImages.map((image, index) => (
                                                <div
                                                    key={`${image.file.name}-${index}`}
                                                    className="overflow-hidden rounded-lg border bg-card"
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt={image.file.name}
                                                        className="h-28 w-full object-cover"
                                                    />
                                                    <div className="space-y-1 p-2 text-xs">
                                                        <p
                                                            className="truncate"
                                                            title={
                                                                image.file.name
                                                            }
                                                        >
                                                            {image.file.name}
                                                        </p>
                                                        <code className="text-muted-foreground">{`[[nueva-captura:${index}]]`}</code>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 border-t pt-5">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={cancelHref}>
                                        <ArrowLeft />
                                        Cancelar
                                    </Link>
                                </Button>
                                <Button
                                    disabled={processing || optimizingImages}
                                >
                                    {processing || optimizingImages ? (
                                        <LoaderCircle className="animate-spin" />
                                    ) : (
                                        <Save />
                                    )}
                                    {values.id
                                        ? 'Guardar cambios'
                                        : 'Publicar guía'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
