import { Form, Head, Link, router } from '@inertiajs/react';
import {
    Download,
    Eye,
    Filter,
    Pencil,
    PlusCircle,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { create, destroy, edit, index } from '@/routes/support-cases';

type SupportCase = {
    id: number;
    reported_date: string;
    reported_time: string | null;
    resolved_time: string | null;
    shift: string;
    technician: string | null;
    reporter: string | null;
    driver: string | null;
    center: string | null;
    case_type: string;
    description: string;
    status: string;
    observations: string | null;
    transport: string | null;
    created_by: string;
    can_manage: boolean;
};
type PageLink = { url: string | null; label: string; active: boolean };
type Props = {
    cases: {
        data: SupportCase[];
        links: PageLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: {
        search: string;
        status: string;
        date: string;
        date_from: string;
        date_to: string;
        type: string;
        center: string;
        shift: string;
    };
    statuses: string[];
    filterOptions: {
        types: string[];
        centers: string[];
        shifts: string[];
    };
    canCreate: boolean;
};
const selectClass =
    'border-input bg-transparent h-9 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring';
const statusVariant = (
    status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' =>
    status === 'Resuelto'
        ? 'secondary'
        : status === 'Escalado'
          ? 'destructive'
          : 'outline';
const formatDate = (value: string) =>
    new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'medium',
        timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
const dayName = (value: string) =>
    new Intl.DateTimeFormat('es-CL', {
        weekday: 'long',
        timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));

export default function SupportCasesIndex({
    cases,
    filters,
    statuses,
    filterOptions,
    canCreate,
}: Props) {
    const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
    const remove = (item: SupportCase) => {
        if (
            window.confirm(
                `\u00bfEliminar el caso #${item.id}? Esta acci\u00f3n no se puede deshacer.`,
            )
        ) {
            router.delete(destroy(item.id).url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Historial de casos" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Historial de casos
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Registro consolidado de atenciones de soporte TI.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <a href="/support-cases/download">
                                <Download />
                                Descargar Excel
                            </a>
                        </Button>
                        {canCreate && (
                            <Button asChild>
                                <Link href={create()}>
                                    <PlusCircle />
                                    Registrar caso
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
                <Form
                    {...index.form()}
                    className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2 xl:grid-cols-4"
                >
                    <div className="relative md:col-span-2 xl:col-span-4">
                        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                        <Input
                            name="search"
                            defaultValue={filters.search}
                            className="pl-9"
                            placeholder="Buscar centro, comunicador, conductor, tipo, transporte o descripción"
                        />
                    </div>
                    {filters.date && (
                        <input type="hidden" name="date" value={filters.date} />
                    )}
                    <FilterField label="Desde">
                        <Input
                            name="date_from"
                            type="date"
                            defaultValue={filters.date_from}
                            aria-label="Fecha inicial"
                        />
                    </FilterField>
                    <FilterField label="Hasta">
                        <Input
                            name="date_to"
                            type="date"
                            defaultValue={filters.date_to}
                            aria-label="Fecha final"
                        />
                    </FilterField>
                    <FilterField label="Tipo">
                        <select
                            name="type"
                            defaultValue={filters.type}
                            className={selectClass}
                        >
                            <option value="">Todos los tipos</option>
                            {filterOptions.types.map((value) => (
                                <option key={value}>{value}</option>
                            ))}
                        </select>
                    </FilterField>
                    <FilterField label="Centro">
                        <select
                            name="center"
                            defaultValue={filters.center}
                            className={selectClass}
                        >
                            <option value="">Todos los centros</option>
                            {filterOptions.centers.map((value) => (
                                <option key={value}>{value}</option>
                            ))}
                        </select>
                    </FilterField>
                    <FilterField label="Estado">
                        <select
                            name="status"
                            defaultValue={filters.status}
                            className={selectClass}
                            aria-label="Filtrar por estado"
                        >
                            <option value="">Todos los estados</option>
                            {statuses.map((status) => (
                                <option key={status}>{status}</option>
                            ))}
                        </select>
                    </FilterField>
                    <FilterField label="Turno">
                        <select
                            name="shift"
                            defaultValue={filters.shift}
                            className={selectClass}
                        >
                            <option value="">Todos los turnos</option>
                            {filterOptions.shifts.map((value) => (
                                <option key={value}>{value}</option>
                            ))}
                        </select>
                    </FilterField>
                    <div className="flex items-end gap-2 md:col-span-2 xl:col-span-2">
                        <Button className="flex-1">
                            <Filter /> Aplicar filtros
                        </Button>
                        {Object.values(filters).some(Boolean) && (
                            <Button variant="ghost" asChild>
                                <Link href={index()}>
                                    <X />
                                    Limpiar
                                </Link>
                            </Button>
                        )}
                    </div>
                </Form>
                <div className="overflow-hidden rounded-xl border bg-card">
                    {cases.data.length === 0 ? (
                        <div className="flex min-h-72 items-center justify-center p-8 text-center">
                            <div>
                                <h2 className="font-medium">
                                    No hay casos para mostrar
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {canCreate
                                        ? 'Registra el primer caso o modifica los filtros aplicados.'
                                        : 'Modifica los filtros aplicados.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50 text-left">
                                    <tr>
                                        <th className="p-3 font-medium">
                                            Fecha / día
                                        </th>
                                        <th className="p-3 font-medium">
                                            Horario
                                        </th>
                                        <th className="p-3 font-medium">
                                            Turno
                                        </th>
                                        <th className="p-3 font-medium">
                                            Técnico
                                        </th>
                                        <th className="p-3 font-medium">
                                            Comunicador / conductor
                                        </th>
                                        <th className="p-3 font-medium">
                                            Tipo
                                        </th>
                                        <th className="p-3 font-medium">
                                            Descripción
                                        </th>
                                        <th className="p-3 font-medium">
                                            Estado
                                        </th>
                                        <th className="p-3 font-medium">
                                            Transporte
                                        </th>
                                        <th className="p-3 text-right font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {cases.data.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="align-top hover:bg-muted/30"
                                        >
                                            <td className="p-3 whitespace-nowrap">
                                                <div>
                                                    {formatDate(
                                                        item.reported_date,
                                                    )}
                                                </div>
                                                <div className="text-muted-foreground capitalize">
                                                    {dayName(
                                                        item.reported_date,
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 whitespace-nowrap">
                                                <div>
                                                    {item.reported_time ||
                                                        '\u2014'}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {item.resolved_time || '—'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline">
                                                    {item.shift}
                                                </Badge>
                                            </td>
                                            <td className="p-3 font-medium">
                                                <div>
                                                    {item.technician || '—'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.center || '—'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div>
                                                    {item.reporter || '—'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {item.driver || '—'}
                                                </div>
                                            </td>
                                            <td className="p-3 font-medium">
                                                {item.case_type}
                                            </td>
                                            <td className="max-w-sm p-3">
                                                <p className="line-clamp-3">
                                                    {item.description}
                                                </p>
                                                {item.observations && (
                                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                        {item.observations}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <Badge
                                                    variant={statusVariant(
                                                        item.status,
                                                    )}
                                                >
                                                    {item.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                {item.transport || '—'}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Ver detalle"
                                                        onClick={() =>
                                                            setSelectedCase(
                                                                item,
                                                            )
                                                        }
                                                    >
                                                        <Eye />
                                                    </Button>
                                                    {item.can_manage ? (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Editar caso"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={edit(
                                                                        item.id,
                                                                    )}
                                                                >
                                                                    <Pencil />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Eliminar caso"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() =>
                                                                    remove(item)
                                                                }
                                                            >
                                                                <Trash2 />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            Solo lectura
                                                        </span>
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
                <CaseDetailsDialog
                    supportCase={selectedCase}
                    onOpenChange={(open) => !open && setSelectedCase(null)}
                />
                {cases.total > 0 && (
                    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-muted-foreground">
                            Mostrando {cases.from}–{cases.to} de {cases.total}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {cases.links.map((link, i) =>
                                link.url ? (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        asChild
                                    >
                                        <Link
                                            href={link.url}
                                            preserveScroll
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ) : (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
function FilterField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            {label}
            {children}
        </label>
    );
}
function CaseDetailsDialog({
    supportCase,
    onOpenChange,
}: {
    supportCase: SupportCase | null;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={supportCase !== null} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
                {supportCase && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                Detalle del caso #{supportCase.id}
                            </DialogTitle>
                            <DialogDescription>
                                Registro completo de la atención de soporte.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Detail
                                label="Fecha"
                                value={`${formatDate(supportCase.reported_date)} · ${dayName(supportCase.reported_date)}`}
                            />
                            <Detail
                                label="Horario"
                                value={`${supportCase.reported_time || '—'} – ${supportCase.resolved_time || '—'}`}
                            />
                            <Detail label="Turno" value={supportCase.shift} />
                            <Detail
                                label="Estado"
                                value={supportCase.status}
                                badge
                            />
                            <Detail
                                label="Técnico"
                                value={supportCase.technician}
                            />
                            <Detail label="Centro" value={supportCase.center} />
                            <Detail
                                label="Comunicador"
                                value={supportCase.reporter}
                            />
                            <Detail
                                label="Conductor"
                                value={supportCase.driver}
                            />
                            <Detail
                                label="Tipo"
                                value={supportCase.case_type}
                            />
                            <Detail
                                label="Transporte"
                                value={supportCase.transport}
                            />
                            <Detail
                                label="Registrado por"
                                value={supportCase.created_by}
                            />
                        </div>
                        <div className="grid gap-4 border-t pt-4">
                            <DetailBlock
                                label="Descripción"
                                value={supportCase.description}
                            />
                            <DetailBlock
                                label="Observaciones"
                                value={supportCase.observations}
                            />
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function Detail({
    label,
    value,
    badge = false,
}: {
    label: string;
    value: string | null;
    badge?: boolean;
}) {
    return (
        <div className="rounded-lg border bg-muted/20 p-3">
            <div className="mb-1 text-xs font-medium text-muted-foreground">
                {label}
            </div>
            {badge && value ? (
                <Badge variant={statusVariant(value)}>{value}</Badge>
            ) : (
                <div className="text-sm font-medium capitalize">
                    {value || '—'}
                </div>
            )}
        </div>
    );
}

function DetailBlock({
    label,
    value,
}: {
    label: string;
    value: string | null;
}) {
    return (
        <div>
            <div className="mb-2 text-sm font-medium">{label}</div>
            <div className="rounded-lg border bg-muted/20 p-4 text-sm leading-6 whitespace-pre-wrap">
                {value || '—'}
            </div>
        </div>
    );
}
SupportCasesIndex.layout = {
    breadcrumbs: [{ title: 'Historial', href: index() }],
};
