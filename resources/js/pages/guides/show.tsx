import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Pencil,
    Trash2,
    UserRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { destroy, edit, index, show } from '@/routes/guides';

type Guide = {
    id: number;
    title: string;
    category: string | null;
    summary: string;
    content: string;
    blocks: Array<
        | { type: 'text'; content: string }
        | { type: 'image'; id: number; name: string; url: string }
    >;
    author: string;
    created_at: string;
    updated_at: string;
    can_manage: boolean;
};

export default function GuideShow({ guide }: { guide: Guide }) {
    return (
        <>
            <Head title={guide.title} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="outline" asChild>
                        <Link href={index()}>
                            <ArrowLeft />
                            Volver a guías
                        </Link>
                    </Button>
                    {guide.can_manage && (
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href={edit(guide.id)}>
                                    <Pencil />
                                    Editar
                                </Link>
                            </Button>
                            <Form
                                {...destroy.form(guide.id)}
                                onSubmit={(event) => {
                                    if (
                                        !window.confirm(
                                            '¿Eliminar esta guía definitivamente?',
                                        )
                                    ) {
                                        event.preventDefault();
                                    }
                                }}
                            >
                                {({ processing }) => (
                                    <Button
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        <Trash2 />
                                        Eliminar
                                    </Button>
                                )}
                            </Form>
                        </div>
                    )}
                </div>

                <Card className="mx-auto w-full max-w-5xl gap-0 overflow-hidden">
                    <CardHeader className="border-b bg-muted/30 p-6 md:p-10">
                        <div className="space-y-4">
                            {guide.category && (
                                <Badge variant="secondary">
                                    {guide.category}
                                </Badge>
                            )}
                            <h1 className="max-w-4xl text-3xl font-bold tracking-tight md:text-4xl">
                                {guide.title}
                            </h1>
                            {guide.summary && (
                                <p className="max-w-3xl text-lg leading-7 text-muted-foreground">
                                    {guide.summary}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <UserRound className="size-4" />
                                    {guide.author}
                                </span>
                                <span className="flex items-center gap-2">
                                    <CalendarDays className="size-4" />
                                    Publicada {guide.created_at}
                                </span>
                                {guide.updated_at !== guide.created_at && (
                                    <span>Actualizada {guide.updated_at}</span>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10">
                        <div className="space-y-6 text-[15px] leading-7 text-foreground">
                            {guide.blocks.map((block, index) =>
                                block.type === 'image' ? (
                                    <figure
                                        key={`image-${block.id}`}
                                        className="overflow-hidden rounded-xl border bg-muted/20"
                                    >
                                        <a
                                            href={block.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <img
                                                src={block.url}
                                                alt={block.name}
                                                className="max-h-[42rem] w-full object-contain"
                                                loading="lazy"
                                            />
                                        </a>
                                        <figcaption className="border-t px-4 py-2 text-xs text-muted-foreground">
                                            {block.name} · Haz clic para ampliar
                                        </figcaption>
                                    </figure>
                                ) : (
                                    <div
                                        key={`text-${index}`}
                                        className="whitespace-pre-wrap"
                                    >
                                        {block.content}
                                    </div>
                                ),
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

GuideShow.layout = {
    breadcrumbs: [
        { title: 'Guías', href: index() },
        { title: 'Detalle', href: show(0) },
    ],
};
