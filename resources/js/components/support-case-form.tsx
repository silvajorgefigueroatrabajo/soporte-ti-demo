import { Form, Link } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
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

type Options = {
    case_types: string[];
    statuses: string[];
    reporters: string[];
    drivers: string[];
    centers: string[];
    driver_centers: Record<string, string>;
};
export type CaseValues = {
    id?: number;
    reported_date: string;
    reported_time: string | null;
    resolved_time: string | null;
    shift: string;
    reporter: string | null;
    driver: string | null;
    center: string | null;
    case_type: string;
    description: string;
    status: string;
    observations: string | null;
    transport: string | null;
};
type Props = {
    title: string;
    description: string;
    technician: string;
    options: Options;
    values: CaseValues;
    form: { action: string; method: 'post' };
    cancelHref: string;
    resetOnSuccess?: boolean;
    lastCase?: Pick<
        CaseValues,
        | 'reporter'
        | 'driver'
        | 'center'
        | 'case_type'
        | 'description'
        | 'observations'
    > | null;
};
const fieldClass =
    'border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 min-h-9 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]';
const dayName = (date: string) =>
    date
        ? new Intl.DateTimeFormat('es-CL', {
              weekday: 'long',
              timeZone: 'UTC',
          }).format(new Date(`${date}T00:00:00Z`))
        : '';

export default function SupportCaseForm({
    title,
    description,
    technician,
    options,
    values,
    form,
    cancelHref,
    resetOnSuccess = false,
    lastCase = null,
}: Props) {
    const [date, setDate] = useState(values.reported_date);
    const [driver, setDriver] = useState(values.driver ?? '');
    const [reporter, setReporter] = useState(values.reporter ?? '');
    const [center, setCenter] = useState(values.center ?? '');
    const [caseType, setCaseType] = useState(values.case_type);
    const [caseDescription, setCaseDescription] = useState(values.description);
    const [observations, setObservations] = useState(values.observations ?? '');
    const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);

    useEffect(() => {
        const timer = window.setTimeout(async () => {
            if (
                !caseType &&
                !center &&
                !driver &&
                caseDescription.trim().length < 5
            ) {
                setSimilarCases([]);

                return;
            }

            const query = new URLSearchParams({
                type: caseType,
                center,
                driver,
                description: caseDescription,
            });
            const response = await fetch(`/support-cases/similar?${query}`, {
                headers: { Accept: 'application/json' },
            });

            if (response.ok) {
                setSimilarCases(await response.json());
            }
        }, 500);

        return () => window.clearTimeout(timer);
    }, [caseType, center, driver, caseDescription]);

    return (
        <Card className="max-w-6xl">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {!values.id && (
                    <div className="mb-5 flex flex-wrap gap-2">
                        {lastCase && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setReporter(lastCase.reporter ?? '');
                                    setDriver(lastCase.driver ?? '');
                                    setCenter(lastCase.center ?? '');
                                    setCaseType(lastCase.case_type);
                                    setCaseDescription(lastCase.description);
                                    setObservations(
                                        lastCase.observations ?? '',
                                    );
                                }}
                            >
                                Reutilizar último caso
                            </Button>
                        )}
                        <select
                            className={fieldClass + ' w-auto'}
                            defaultValue=""
                            onChange={(event) => {
                                const template =
                                    quickTemplates[event.target.value];

                                if (template) {
                                    setCaseType(template.type);
                                    setCaseDescription(template.description);
                                }

                                event.target.value = '';
                            }}
                        >
                            <option value="">Usar plantilla rápida…</option>
                            <option value="sync">
                                Sincronización no llega a POS
                            </option>
                            <option value="mobile">
                                Problema aplicación Portal
                            </option>
                            <option value="documents">
                                Documentos no disponibles
                            </option>
                        </select>
                    </div>
                )}
                <Form
                    {...form}
                    resetOnSuccess={resetOnSuccess}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                <Field
                                    label="Fecha *"
                                    error={errors.reported_date}
                                >
                                    <Input
                                        name="reported_date"
                                        type="date"
                                        value={date}
                                        onChange={(event) =>
                                            setDate(event.target.value)
                                        }
                                        required
                                    />
                                </Field>
                                <Field label="Día">
                                    <Input
                                        value={dayName(date)}
                                        readOnly
                                        className="text-muted-foreground capitalize"
                                    />
                                </Field>
                                <Field
                                    label="Hora reporte *"
                                    error={errors.reported_time}
                                >
                                    <Input
                                        name="reported_time"
                                        type="time"
                                        defaultValue={
                                            values.reported_time ?? ''
                                        }
                                        required
                                    />
                                </Field>
                                <Field
                                    label="Hora resuelto"
                                    error={errors.resolved_time}
                                >
                                    <Input
                                        name="resolved_time"
                                        type="time"
                                        defaultValue={
                                            values.resolved_time ?? ''
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Turno asignado"
                                    error={errors.shift}
                                >
                                    <Input
                                        value={values.shift || 'Sin configurar'}
                                        readOnly
                                        className="bg-muted text-muted-foreground"
                                    />
                                </Field>
                                <Field label="Técnico de turno">
                                    <Input
                                        value={technician}
                                        readOnly
                                        className="bg-muted text-muted-foreground"
                                    />
                                </Field>
                                <Field
                                    label="Comunicador *"
                                    error={errors.reporter}
                                >
                                    <CreatableInput
                                        name="reporter"
                                        listId="reporters"
                                        options={options.reporters}
                                        placeholder="Seleccionar o escribir comunicador"
                                        value={values.reporter}
                                        controlledValue={reporter}
                                        onChange={setReporter}
                                        required
                                    />
                                </Field>
                                <Field label="Conductor" error={errors.driver}>
                                    <CreatableInput
                                        name="driver"
                                        listId="drivers"
                                        options={options.drivers}
                                        placeholder="Seleccionar o escribir conductor"
                                        value={values.driver}
                                        controlledValue={driver}
                                        onChange={(value) => {
                                            setDriver(value);
                                            const relatedCenter =
                                                options.driver_centers[value];

                                            if (relatedCenter) {
                                                setCenter(relatedCenter);
                                            }
                                        }}
                                    />
                                </Field>
                                <Field label="Centro" error={errors.center}>
                                    <CreatableInput
                                        name="center"
                                        listId="centers"
                                        options={options.centers}
                                        placeholder="Seleccionar o escribir centro"
                                        value={values.center}
                                        controlledValue={center}
                                        onChange={setCenter}
                                    />
                                </Field>
                                <Field label="Tipo *" error={errors.case_type}>
                                    <CreatableInput
                                        name="case_type"
                                        listId="case-types"
                                        options={options.case_types}
                                        placeholder="Seleccionar o escribir tipo"
                                        value={values.case_type}
                                        controlledValue={caseType}
                                        onChange={setCaseType}
                                        required
                                    />
                                </Field>
                                <Field label="Estado *" error={errors.status}>
                                    <OptionSelect
                                        name="status"
                                        label="Seleccionar estado"
                                        options={options.statuses}
                                        value={values.status}
                                    />
                                </Field>
                                <Field
                                    label="Transporte"
                                    error={errors.transport}
                                >
                                    <Input
                                        name="transport"
                                        defaultValue={values.transport ?? ''}
                                        placeholder="Ingresar número de transporte"
                                    />
                                </Field>
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                                <Field
                                    label="Descripción *"
                                    error={errors.description}
                                >
                                    <textarea
                                        name="description"
                                        rows={5}
                                        required
                                        className={fieldClass}
                                        value={caseDescription}
                                        onChange={(event) =>
                                            setCaseDescription(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Describe el problema reportado"
                                    />
                                </Field>
                                <Field
                                    label="Observaciones"
                                    error={errors.observations}
                                >
                                    <textarea
                                        name="observations"
                                        rows={5}
                                        className={fieldClass}
                                        value={observations}
                                        onChange={(event) =>
                                            setObservations(event.target.value)
                                        }
                                        placeholder="Solución aplicada o información adicional"
                                    />
                                </Field>
                            </div>
                            {similarCases.length > 0 && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                                    <h3 className="font-medium">
                                        Casos parecidos encontrados
                                    </h3>
                                    <p className="mb-3 text-xs text-muted-foreground">
                                        Revisa soluciones anteriores antes de
                                        guardar un caso repetido.
                                    </p>
                                    <div className="grid gap-2 md:grid-cols-2">
                                        {similarCases.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-lg border bg-background p-3 text-sm"
                                            >
                                                <div className="flex justify-between gap-2 font-medium">
                                                    <span>
                                                        #{item.id} · {item.type}
                                                    </span>
                                                    <span>{item.status}</span>
                                                </div>
                                                <p className="mt-1 line-clamp-2">
                                                    {item.description}
                                                </p>
                                                {item.observations && (
                                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                        Solución:{' '}
                                                        {item.observations}
                                                    </p>
                                                )}
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    {item.date}
                                                    {item.center
                                                        ? ` · ${item.center}`
                                                        : ''}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-3 border-t pt-5">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={cancelHref}>
                                        <ArrowLeft />
                                        Cancelar
                                    </Link>
                                </Button>
                                <Button disabled={processing}>
                                    {processing ? (
                                        <LoaderCircle className="animate-spin" />
                                    ) : (
                                        <Save />
                                    )}
                                    {values.id
                                        ? 'Guardar cambios'
                                        : 'Guardar caso'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
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
        <div className="grid content-start gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
function OptionSelect({
    name,
    label,
    options,
    value,
}: {
    name: string;
    label: string;
    options: string[];
    value: string;
}) {
    return (
        <select
            name={name}
            defaultValue={value}
            required
            className={fieldClass}
        >
            <option value="" disabled>
                {label}
            </option>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
}
function CreatableInput({
    name,
    listId,
    options,
    placeholder,
    value,
    required = false,
    controlledValue,
    onChange,
}: {
    name: string;
    listId: string;
    options: string[];
    placeholder: string;
    value: string | null;
    required?: boolean;
    controlledValue?: string;
    onChange?: (value: string) => void;
}) {
    return (
        <>
            <Input
                name={name}
                list={listId}
                placeholder={placeholder}
                {...(onChange
                    ? {
                          value: controlledValue ?? '',
                          onChange: (event) => onChange(event.target.value),
                      }
                    : { defaultValue: value ?? '' })}
                autoComplete="off"
                required={required}
            />
            <datalist id={listId}>
                {options.map((option) => (
                    <option key={option} value={option} />
                ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
                Si no existe, escríbelo y se agregará al guardar.
            </p>
        </>
    );
}

type SimilarCase = {
    id: number;
    date: string;
    type: string;
    center: string | null;
    description: string;
    observations: string | null;
    status: string;
};
const quickTemplates: Record<string, { type: string; description: string }> = {
    sync: {
        type: 'Sincronización',
        description: 'Sincronización no llega a POS.',
    },
    mobile: {
        type: 'Aplicación móvil',
        description: 'La aplicación Portal presenta problemas.',
    },
    documents: {
        type: 'Documentos',
        description: 'No hay folios disponibles para operar.',
    },
};
