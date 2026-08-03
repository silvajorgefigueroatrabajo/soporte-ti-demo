import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Eye,
    IdCard,
    Pencil,
    Plus,
    Search,
    Trash2,
    Upload,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
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
import { destroy, index, store, update } from '@/routes/drivers';

type Driver = {
    id: number;
    center_code: string | null;
    center_name: string | null;
    name: string;
    pos_serial: string | null;
    chip_type: string | null;
    sap_code: string | null;
    rut: string | null;
    username: string | null;
    email: string | null;
    company: string | null;
    email_password: string | null;
    btp_user: string | null;
    observations: string | null;
    request_date: string | null;
    go_live: string | null;
};
type PageLink = { url: string | null; label: string; active: boolean };
type Props = {
    drivers: {
        data: Driver[];
        links: PageLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: { search: string };
    canManage: boolean;
};
const emptyDriver = {
    center_code: '',
    center_name: '',
    name: '',
    pos_serial: '',
    chip_type: '',
    sap_code: '',
    rut: '',
    username: '',
    email: '',
    company: '',
    email_password: '',
    btp_user: '',
    observations: '',
    request_date: '',
    go_live: '',
};

export default function DriversIndex({ drivers, filters, canManage }: Props) {
    const [editing, setEditing] = useState<Driver | null | undefined>(
        undefined,
    );
    const [viewing, setViewing] = useState<Driver | null>(null);
    const importForm = useForm<{ file: File | null }>({ file: null });
    const remove = (driver: Driver) => {
        if (
            confirm(
                `¿Eliminar a ${driver.name}? Los casos históricos conservarán el nombre.`,
            )
        ) {
            router.delete(destroy(driver.id).url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Conductores" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-semibold">
                            <IdCard className="size-6" />
                            Conductores
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Directorio operativo de conductores, equipos POS y
                            accesos asociados.
                        </p>
                    </div>
                    {canManage && (
                        <div className="flex flex-wrap gap-2">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
                                <Upload className="size-4" />
                                Importar TSV
                                <input
                                    type="file"
                                    accept=".txt,.tsv"
                                    className="hidden"
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0] ?? null;

                                        if (!file) {
                                            return;
                                        }

                                        importForm.setData('file', file);
                                        importForm.post('/drivers/import', {
                                            forceFormData: true,
                                            preserveScroll: true,
                                            onSuccess: () => importForm.reset(),
                                        });
                                    }}
                                />
                            </label>
                            <Button onClick={() => setEditing(null)}>
                                <Plus />
                                Agregar conductor
                            </Button>
                        </div>
                    )}
                </div>
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="border-b p-4">
                        <form
                            action={index().url}
                            className="flex max-w-2xl gap-2"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    name="search"
                                    defaultValue={filters.search}
                                    className="pl-9"
                                    placeholder="Buscar conductor, centro, POS, RUT, SAP, usuario o correo"
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
                    {drivers.data.length === 0 ? (
                        <div className="p-12 text-center text-sm text-muted-foreground">
                            No se encontraron conductores.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1250px] text-sm">
                                <thead className="border-b bg-muted/50 text-left">
                                    <tr>
                                        <th className="p-3 font-medium">
                                            Centro
                                        </th>
                                        <th className="p-3 font-medium">
                                            Conductor
                                        </th>
                                        <th className="p-3 font-medium">
                                            POS / Chip
                                        </th>
                                        <th className="p-3 font-medium">
                                            SAP / RUT
                                        </th>
                                        <th className="p-3 font-medium">
                                            Usuario / Correo
                                        </th>
                                        <th className="p-3 font-medium">
                                            Empresa
                                        </th>
                                        <th className="p-3 font-medium">BTP</th>
                                        <th className="p-3 text-right font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {drivers.data.map((driver) => (
                                        <tr
                                            key={driver.id}
                                            className="align-top hover:bg-muted/30"
                                        >
                                            <td className="p-3">
                                                <div className="font-medium">
                                                    {driver.center_name || '—'}
                                                </div>
                                                <div className="font-mono text-xs text-muted-foreground">
                                                    {driver.center_code || '—'}
                                                </div>
                                            </td>
                                            <td className="p-3 font-medium">
                                                {driver.name}
                                            </td>
                                            <td className="p-3">
                                                <div className="font-mono text-xs">
                                                    {driver.pos_serial || '—'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {driver.chip_type || '—'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div>
                                                    {driver.sap_code || '—'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {driver.rut || '—'}
                                                </div>
                                            </td>
                                            <td className="max-w-64 p-3">
                                                <div>
                                                    {driver.username || '—'}
                                                </div>
                                                <div
                                                    className="truncate text-xs text-muted-foreground"
                                                    title={driver.email || ''}
                                                >
                                                    {driver.email || '—'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {driver.company || '—'}
                                            </td>
                                            <td className="p-3">
                                                <Badge
                                                    variant={
                                                        driver.btp_user?.toUpperCase() ===
                                                        'SI'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {driver.btp_user || '—'}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Ver conductor"
                                                        onClick={() =>
                                                            setViewing(driver)
                                                        }
                                                    >
                                                        <Eye />
                                                    </Button>
                                                    {canManage && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Editar conductor"
                                                                onClick={() =>
                                                                    setEditing(
                                                                        driver,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Eliminar conductor"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() =>
                                                                    remove(
                                                                        driver,
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
                {drivers.total > 0 && (
                    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-muted-foreground">
                            Mostrando {drivers.from}–{drivers.to} de{' '}
                            {drivers.total}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {drivers.links.map((link, i) =>
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
            <DriverDetailsDialog
                driver={viewing}
                onOpenChange={(open) => !open && setViewing(null)}
            />
            {editing !== undefined && (
                <DriverDialog
                    driver={editing}
                    onOpenChange={(open) => !open && setEditing(undefined)}
                />
            )}
        </>
    );
}

function DriverDetailsDialog({
    driver,
    onOpenChange,
}: {
    driver: Driver | null;
    onOpenChange: (open: boolean) => void;
}) {
    const details = driver
        ? [
              ['Código centro', driver.center_code],
              ['Centro', driver.center_name],
              ['Conductor', driver.name],
              ['Serie POS', driver.pos_serial],
              ['Tipo chip', driver.chip_type],
              ['Código SAP', driver.sap_code],
              ['RUT', driver.rut],
              ['Usuario', driver.username],
              ['Correo', driver.email],
              ['Empresa', driver.company],
              ['Clave Email', driver.email_password],
              ['Usuario BTP', driver.btp_user],
              ['Fecha solicitud', driver.request_date],
              ['Go Live', driver.go_live],
              ['Observaciones', driver.observations],
          ]
        : [];

    return (
        <Dialog open={driver !== null} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Detalle del conductor</DialogTitle>
                    <DialogDescription>
                        Información completa del registro. La clave se descifra
                        de forma segura al consultar.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {details.map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-lg border bg-muted/20 p-3"
                        >
                            <div className="mb-1 text-xs font-medium text-muted-foreground">
                                {label}
                            </div>
                            <div className="text-sm font-medium break-words">
                                {value || '—'}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
function DriverDialog({
    driver,
    onOpenChange,
}: {
    driver: Driver | null;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm(
        driver
            ? {
                  center_code: driver.center_code ?? '',
                  center_name: driver.center_name ?? '',
                  name: driver.name,
                  pos_serial: driver.pos_serial ?? '',
                  chip_type: driver.chip_type ?? '',
                  sap_code: driver.sap_code ?? '',
                  rut: driver.rut ?? '',
                  username: driver.username ?? '',
                  email: driver.email ?? '',
                  company: driver.company ?? '',
                  email_password: driver.email_password ?? '',
                  btp_user: driver.btp_user ?? '',
                  observations: driver.observations ?? '',
                  request_date: driver.request_date ?? '',
                  go_live: driver.go_live ?? '',
              }
            : emptyDriver,
    );
    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (driver) {
            form.put(update(driver.id).url, options);
        } else {
            form.post(store().url, options);
        }
    };

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>
                            {driver ? 'Editar conductor' : 'Agregar conductor'}
                        </DialogTitle>
                        <DialogDescription>
                            La contraseña de correo no se almacena por
                            seguridad. El nombre quedará disponible en Registrar
                            Caso.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-3">
                        <Field
                            label="Código centro"
                            error={form.errors.center_code}
                        >
                            <Input
                                value={form.data.center_code}
                                onChange={(e) =>
                                    form.setData('center_code', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Centro" error={form.errors.center_name}>
                            <Input
                                value={form.data.center_name}
                                onChange={(e) =>
                                    form.setData('center_name', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Conductor *" error={form.errors.name}>
                            <Input
                                required
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                            />
                        </Field>
                        <Field
                            label="Número de serie POS"
                            error={form.errors.pos_serial}
                        >
                            <Input
                                value={form.data.pos_serial}
                                onChange={(e) =>
                                    form.setData('pos_serial', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Tipo chip" error={form.errors.chip_type}>
                            <Input
                                value={form.data.chip_type}
                                onChange={(e) =>
                                    form.setData('chip_type', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Código SAP" error={form.errors.sap_code}>
                            <Input
                                value={form.data.sap_code}
                                onChange={(e) =>
                                    form.setData('sap_code', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="RUT" error={form.errors.rut}>
                            <Input
                                value={form.data.rut}
                                onChange={(e) =>
                                    form.setData('rut', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Usuario" error={form.errors.username}>
                            <Input
                                value={form.data.username}
                                onChange={(e) =>
                                    form.setData('username', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Correo" error={form.errors.email}>
                            <Input
                                type="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Empresa" error={form.errors.company}>
                            <Input
                                value={form.data.company}
                                onChange={(e) =>
                                    form.setData('company', e.target.value)
                                }
                            />
                        </Field>
                        <Field
                            label="Clave Email"
                            error={form.errors.email_password}
                        >
                            <Input
                                value={form.data.email_password}
                                onChange={(e) =>
                                    form.setData(
                                        'email_password',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label="Usuario BTP" error={form.errors.btp_user}>
                            <select
                                value={form.data.btp_user}
                                onChange={(e) =>
                                    form.setData('btp_user', e.target.value)
                                }
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                            >
                                <option value="">Sin información</option>
                                <option value="SI">SI</option>
                                <option value="NO">NO</option>
                                <option value="N/A">N/A</option>
                                <option value="NN">NN</option>
                            </select>
                        </Field>
                        <Field
                            label="Fecha solicitud"
                            error={form.errors.request_date}
                        >
                            <Input
                                value={form.data.request_date}
                                onChange={(e) =>
                                    form.setData('request_date', e.target.value)
                                }
                                placeholder="Según registro original"
                            />
                        </Field>
                        <Field label="Go Live" error={form.errors.go_live}>
                            <Input
                                value={form.data.go_live}
                                onChange={(e) =>
                                    form.setData('go_live', e.target.value)
                                }
                                placeholder="Fecha o estado"
                            />
                        </Field>
                        <div className="sm:col-span-2 lg:col-span-3">
                            <Field
                                label="Observaciones"
                                error={form.errors.observations}
                            >
                                <textarea
                                    rows={3}
                                    value={form.data.observations}
                                    onChange={(e) =>
                                        form.setData(
                                            'observations',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                                />
                            </Field>
                        </div>
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
                                : driver
                                  ? 'Guardar cambios'
                                  : 'Agregar conductor'}
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
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
DriversIndex.layout = {
    breadcrumbs: [{ title: 'Conductores', href: index() }],
};
