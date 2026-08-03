import { Head, Link, router, useForm } from '@inertiajs/react';
import { Building2, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index, store, update, destroy } from '@/routes/centers';

type Center = {
    id: number;
    code: string | null;
    name: string;
    type: string | null;
    responsible: string | null;
    focal_point: string | null;
    pos_status: 'SI' | 'NO' | 'N/A';
    go_live_date: string | null;
};

type Props = {
    centers: Center[];
    filters: { search: string };
    canManage: boolean;
};

const emptyCenter = {
    code: '',
    name: '',
    type: '',
    responsible: '',
    focal_point: '',
    pos_status: 'SI' as const,
    go_live_date: '',
};

export default function CentersIndex({ centers, filters, canManage }: Props) {
    const [viewing, setViewing] = useState<Center | null>(null);
    const [editing, setEditing] = useState<Center | null | undefined>(
        undefined,
    );

    const remove = (center: Center) => {
        if (
            confirm(
                `¿Eliminar el centro ${center.name}? Los casos ya registrados conservarán ese nombre.`,
            )
        ) {
            router.delete(destroy(center.id).url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Centros" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-semibold">
                            <Building2 className="size-6" />
                            Centros
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Información operativa de los centros disponibles al
                            registrar casos.
                        </p>
                    </div>
                    {canManage && (
                        <Button onClick={() => setEditing(null)}>
                            <Plus /> Agregar centro
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-4">
                        <form
                            action={index().url}
                            className="flex max-w-xl gap-2"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    name="search"
                                    defaultValue={filters.search}
                                    className="pl-9"
                                    placeholder="Buscar por código, centro, responsable o focal point"
                                />
                            </div>
                            <Button type="submit" variant="outline">
                                Buscar
                            </Button>
                            {filters.search && (
                                <Button variant="ghost" asChild>
                                    <Link href={index()}>Limpiar</Link>
                                </Button>
                            )}
                        </form>
                    </div>

                    {centers.length === 0 ? (
                        <div className="p-12 text-center text-sm text-muted-foreground">
                            No se encontraron centros.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px] text-sm">
                                <thead className="border-b bg-muted/50 text-left">
                                    <tr>
                                        <th className="p-3 font-medium">
                                            Código
                                        </th>
                                        <th className="p-3 font-medium">
                                            Nombre
                                        </th>
                                        <th className="p-3 font-medium">
                                            Tipo
                                        </th>
                                        <th className="p-3 font-medium">
                                            Responsable
                                        </th>
                                        <th className="p-3 font-medium">
                                            Focal Point
                                        </th>
                                        <th className="p-3 font-medium">
                                            Terminales POS
                                        </th>
                                        <th className="p-3 font-medium">
                                            Go Live
                                        </th>
                                        <th className="p-3 text-right font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {centers.map((center) => (
                                        <tr
                                            key={center.id}
                                            className="hover:bg-muted/30"
                                        >
                                            <td className="p-3 font-mono text-xs">
                                                {center.code || '—'}
                                            </td>
                                            <td className="p-3 font-medium">
                                                {center.name}
                                            </td>
                                            <td className="p-3">
                                                {center.type || '—'}
                                            </td>
                                            <td className="p-3">
                                                {center.responsible || '—'}
                                            </td>
                                            <td className="p-3">
                                                {center.focal_point || '—'}
                                            </td>
                                            <td className="p-3">
                                                <Badge
                                                    variant={
                                                        center.pos_status ===
                                                        'SI'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {center.pos_status}
                                                </Badge>
                                            </td>
                                            <td className="p-3 whitespace-nowrap">
                                                {formatDate(
                                                    center.go_live_date,
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Ver centro"
                                                        onClick={() =>
                                                            setViewing(center)
                                                        }
                                                    >
                                                        <Eye />
                                                    </Button>
                                                    {canManage && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Editar centro"
                                                                onClick={() =>
                                                                    setEditing(
                                                                        center,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Eliminar centro"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() =>
                                                                    remove(
                                                                        center,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <CenterDetailsDialog
                center={viewing}
                onOpenChange={(open) => !open && setViewing(null)}
            />
            {editing !== undefined && (
                <CenterDialog
                    center={editing}
                    onOpenChange={(open) => !open && setEditing(undefined)}
                />
            )}
        </>
    );
}

function CenterDetailsDialog({
    center,
    onOpenChange,
}: {
    center: Center | null;
    onOpenChange: (open: boolean) => void;
}) {
    const details = center
        ? [
              ['Código', center.code],
              ['Nombre', center.name],
              ['Tipo', center.type],
              ['Responsable', center.responsible],
              ['Focal Point', center.focal_point],
              ['Terminales POS', center.pos_status],
              ['Go Live', formatDate(center.go_live_date)],
          ]
        : [];

    return (
        <Dialog open={center !== null} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalle del centro</DialogTitle>
                    <DialogDescription>
                        Información operativa completa del centro.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 sm:grid-cols-2">
                    {details.map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-lg border bg-muted/20 p-3"
                        >
                            <div className="mb-1 text-xs font-medium text-muted-foreground">
                                {label}
                            </div>
                            <div className="text-sm font-medium">
                                {value || '—'}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
function CenterDialog({
    center,
    onOpenChange,
}: {
    center: Center | null;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm(
        center
            ? {
                  code: center.code ?? '',
                  name: center.name,
                  type: center.type ?? '',
                  responsible: center.responsible ?? '',
                  focal_point: center.focal_point ?? '',
                  pos_status: center.pos_status,
                  go_live_date: center.go_live_date ?? '',
              }
            : emptyCenter,
    );

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (center) {
            form.put(update(center.id).url, options);
        } else {
            form.post(store().url, options);
        }
    };

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>
                            {center ? 'Editar centro' : 'Agregar centro'}
                        </DialogTitle>
                        <DialogDescription>
                            Estos datos estarán disponibles para consulta y el
                            nombre aparecerá en Registrar Caso.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-5 sm:grid-cols-2">
                        <Field label="Código" error={form.errors.code}>
                            <Input
                                value={form.data.code}
                                onChange={(event) =>
                                    form.setData('code', event.target.value)
                                }
                                placeholder="Ej: 300"
                            />
                        </Field>
                        <Field label="Nombre *" error={form.errors.name}>
                            <Input
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                required
                                placeholder="Nombre del centro"
                            />
                        </Field>
                        <Field label="Tipo" error={form.errors.type}>
                            <Input
                                value={form.data.type}
                                onChange={(event) =>
                                    form.setData('type', event.target.value)
                                }
                                placeholder="Planta, Centro Logístico..."
                            />
                        </Field>
                        <Field
                            label="Responsable"
                            error={form.errors.responsible}
                        >
                            <Input
                                value={form.data.responsible}
                                onChange={(event) =>
                                    form.setData(
                                        'responsible',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field
                            label="Focal Point"
                            error={form.errors.focal_point}
                        >
                            <Input
                                value={form.data.focal_point}
                                onChange={(event) =>
                                    form.setData(
                                        'focal_point',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field
                            label="Terminales POS (habilitados) *"
                            error={form.errors.pos_status}
                        >
                            <select
                                value={form.data.pos_status}
                                onChange={(event) =>
                                    form.setData(
                                        'pos_status',
                                        event.target.value as
                                            'SI' | 'NO' | 'N/A',
                                    )
                                }
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-3"
                            >
                                <option value="SI">SI</option>
                                <option value="NO">NO</option>
                                <option value="N/A">N/A</option>
                            </select>
                        </Field>
                        <Field label="Go Live" error={form.errors.go_live_date}>
                            <Input
                                type="date"
                                value={form.data.go_live_date}
                                onChange={(event) =>
                                    form.setData(
                                        'go_live_date',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button disabled={form.processing}>
                            {form.processing
                                ? 'Guardando...'
                                : center
                                  ? 'Guardar cambios'
                                  : 'Agregar centro'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function formatDate(value: string | null) {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('es-CL', { timeZone: 'UTC' }).format(
        new Date(`${value}T00:00:00Z`),
    );
}

CentersIndex.layout = { breadcrumbs: [{ title: 'Centros', href: index() }] };
