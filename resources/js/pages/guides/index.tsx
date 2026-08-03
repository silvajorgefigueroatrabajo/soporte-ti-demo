import { Form, Head, Link } from '@inertiajs/react';
import { BookOpen, PlusCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { create, index, show } from '@/routes/guides';

type Guide = {
    id: number;
    title: string;
    category: string | null;
    summary: string;
    author: string;
    created_at: string;
};

type PageLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    guides: {
        data: Guide[];
        links: PageLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: { search: string; category: string };
    categories: string[];
    canCreate: boolean;
};

export default function GuideIndex({
    guides,
    filters,
    categories,
    canCreate,
}: Props) {
    return (
        <>
            <Head title="Guías" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Guías del equipo
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Soluciones y procedimientos compartidos por los
                            técnicos de soporte.
                        </p>
                    </div>
                    {canCreate && (
                        <Button asChild>
                            <Link href={create()}>
                                <PlusCircle />
                                Crear guía
                            </Link>
                        </Button>
                    )}
                </div>

                <Form
                    action={index().url}
                    method="get"
                    className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_14rem_auto]"
                >
                    <div className="relative">
                        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                        <Input
                            name="search"
                            defaultValue={filters.search}
                            className="pl-9"
                            placeholder="Buscar por título, contenido, categoría o autor"
                        />
                    </div>
                    <select
                        name="category"
                        defaultValue={filters.category}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                    <Button>Filtrar</Button>
                </Form>

                {guides.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                            <span className="rounded-full bg-muted p-4">
                                <BookOpen className="size-8 text-muted-foreground" />
                            </span>
                            <div>
                                <p className="font-medium">
                                    No encontramos guías
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Ajusta los filtros o publica el primer
                                    aporte del equipo.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {guides.data.map((guide) => (
                            <Card key={guide.id} className="h-full gap-4">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-3">
                                        <CardTitle className="line-clamp-2 text-lg">
                                            {guide.title}
                                        </CardTitle>
                                        {guide.category && (
                                            <Badge variant="secondary">
                                                {guide.category}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription>
                                        Por {guide.author} · {guide.created_at}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                                        {guide.summary}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        asChild
                                    >
                                        <Link href={show(guide.id)}>
                                            <BookOpen />
                                            Leer guía
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {guides.links.length > 3 && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {guides.from ?? 0}-{guides.to ?? 0} de{' '}
                            {guides.total}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {guides.links.map((link, position) => (
                                <Button
                                    key={`${link.label}-${position}`}
                                    size="sm"
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    disabled={!link.url}
                                    asChild={Boolean(link.url)}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            preserveScroll
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

GuideIndex.layout = {
    breadcrumbs: [{ title: 'Guías', href: index() }],
};
