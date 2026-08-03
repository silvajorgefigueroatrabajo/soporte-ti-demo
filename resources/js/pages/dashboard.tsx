import { Form, Head, Link, router } from '@inertiajs/react';
import type { BarChart3 } from 'lucide-react';
import {
    CheckCircle2,
    CircleHelp,
    ClipboardList,
    TrendingUp,
    Percent,
    Clock3,
    TimerReset,
    Save,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as supportCases } from '@/routes/support-cases';

type Datum = { label: string; value: number };
type ExplorerDatum = Datum & { cases: number };
type ExplorerFilters = {
    from: string;
    to: string;
    status: string;
    type: string;
    center: string;
    shift: string;
    group: string;
    metric: string;
    chart: string;
};
type Props = {
    selectedMonth: string;
    months: string[];
    summary: {
        total: number;
        resolved: number;
        escalated: number;
        unanswered: number;
        resolutionRate: number;
        averageResolutionMinutes: number | null;
        within30Rate: number | null;
        timedCases: number;
        monthlyChange: number | null;
    };
    byStatus: Datum[];
    byType: Datum[];
    byCenter: Datum[];
    byDay: Datum[];
    explorer: {
        filters: ExplorerFilters;
        data: ExplorerDatum[];
        options: {
            statuses: string[];
            shifts: string[];
            types: string[];
            centers: string[];
        };
    };
};
const colors = ['#3b82f6', '#f97316', '#a3a3a3'];
const monthLabel = (month: string) =>
    new Intl.DateTimeFormat('es-CL', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${month}-01T00:00:00Z`));
const historyUrl = (month: string, filters: Record<string, string> = {}) => {
    const [year, monthNumber] = month.split('-').map(Number);
    const lastDay = new Date(Date.UTC(year, monthNumber, 0))
        .toISOString()
        .slice(0, 10);
    const query = new URLSearchParams({
        date_from: `${month}-01`,
        date_to: lastDay,
        ...filters,
    });

    return `${supportCases().url}?${query}`;
};

export default function Dashboard({
    selectedMonth,
    months,
    summary,
    byStatus,
    byType,
    byCenter,
    byDay,
    explorer,
}: Props) {
    const totalStatus = byStatus.reduce((sum, item) => sum + item.value, 0);
    const maxType = Math.max(...byType.map((item) => item.value), 1);
    let cursor = 0;
    const segments = byStatus.map((item, index) => {
        const start = cursor;
        cursor += totalStatus ? (item.value / totalStatus) * 100 : 0;

        return `${colors[index]} ${start}% ${cursor}%`;
    });
    const donut = totalStatus
        ? `conic-gradient(${segments.join(', ')})`
        : 'conic-gradient(#e5e7eb 0 100%)';

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Gestión de Soporte TI
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Resumen mensual de casos registrados.
                        </p>
                    </div>
                    <Form {...dashboard.form()} className="flex gap-2">
                        <select
                            name="month"
                            defaultValue={selectedMonth}
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                        >
                            {months.map((month) => (
                                <option key={month} value={month}>
                                    {monthLabel(month)}
                                </option>
                            ))}
                        </select>
                        <Button>Ver mes</Button>
                    </Form>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric
                        title="Casos totales"
                        value={summary.total}
                        icon={ClipboardList}
                        tone="text-blue-600 bg-blue-500/10"
                        href={historyUrl(selectedMonth)}
                    />
                    <Metric
                        title="Tiempo promedio"
                        value={
                            summary.averageResolutionMinutes === null
                                ? '—'
                                : `${summary.averageResolutionMinutes} min`
                        }
                        icon={Clock3}
                        tone="text-cyan-600 bg-cyan-500/10"
                        href={historyUrl(selectedMonth)}
                        detail={`${summary.timedCases} ${caseLabel(summary.timedCases)} con horario completo`}
                    />
                    <Metric
                        title="Resueltos en 30 min"
                        value={
                            summary.within30Rate === null
                                ? '—'
                                : `${summary.within30Rate}%`
                        }
                        icon={TimerReset}
                        tone="text-teal-600 bg-teal-500/10"
                        href={historyUrl(selectedMonth, { status: 'Resuelto' })}
                    />
                    <Metric
                        title="Variación mensual"
                        value={
                            summary.monthlyChange === null
                                ? 'Sin base'
                                : `${summary.monthlyChange > 0 ? '+' : ''}${summary.monthlyChange}%`
                        }
                        icon={TrendingUp}
                        tone="text-indigo-600 bg-indigo-500/10"
                        href={historyUrl(selectedMonth)}
                        detail="Comparado con el mes anterior"
                    />
                    <Metric
                        title="Resueltos"
                        value={summary.resolved}
                        icon={CheckCircle2}
                        tone="text-emerald-600 bg-emerald-500/10"
                        href={historyUrl(selectedMonth, { status: 'Resuelto' })}
                    />
                    <Metric
                        title="Escalados"
                        value={summary.escalated}
                        icon={TrendingUp}
                        tone="text-orange-600 bg-orange-500/10"
                        href={historyUrl(selectedMonth, { status: 'Escalado' })}
                    />
                    <Metric
                        title="Sin respuesta"
                        value={summary.unanswered}
                        icon={CircleHelp}
                        tone="text-neutral-600 bg-neutral-500/10"
                        href={historyUrl(selectedMonth, {
                            status: 'Sin Respuesta',
                        })}
                    />
                    <Metric
                        title="Tasa de resolución"
                        value={String(summary.resolutionRate) + '%'}
                        icon={Percent}
                        tone="text-violet-600 bg-violet-500/10"
                        href={historyUrl(selectedMonth, { status: 'Resuelto' })}
                    />
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Casos por estado</CardTitle>
                            <CardDescription>
                                Distribución durante {monthLabel(selectedMonth)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {totalStatus === 0 ? (
                                <Empty />
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-8 py-4 sm:flex-row">
                                    <div
                                        className="relative size-52 shrink-0 rounded-full"
                                        style={{ background: donut }}
                                    >
                                        <div className="absolute inset-12 flex items-center justify-center rounded-full bg-card">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold">
                                                    {totalStatus}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    casos
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid gap-3">
                                        {byStatus.map((item, index) => (
                                            <Link
                                                key={item.label}
                                                href={historyUrl(
                                                    selectedMonth,
                                                    { status: item.label },
                                                )}
                                                className="flex min-w-48 items-center justify-between gap-6 rounded-md p-1 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span
                                                        className="size-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                colors[index],
                                                        }}
                                                    />
                                                    {item.label}
                                                </span>
                                                <span className="font-semibold">
                                                    {item.value}{' '}
                                                    <span className="font-normal text-muted-foreground">
                                                        (
                                                        {Math.round(
                                                            (item.value /
                                                                totalStatus) *
                                                                100,
                                                        )}
                                                        %)
                                                    </span>
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Incidencias por tipo</CardTitle>
                            <CardDescription>
                                Cantidad de casos agrupados por categoría
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {byType.length === 0 ? (
                                <Empty />
                            ) : (
                                <div className="space-y-4">
                                    {byType.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={historyUrl(selectedMonth, {
                                                type: item.label,
                                            })}
                                            className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-sm"
                                        >
                                            <span
                                                className="truncate text-right text-muted-foreground"
                                                title={item.label}
                                            >
                                                {item.label}
                                            </span>
                                            <div className="h-7 overflow-hidden rounded-sm bg-muted">
                                                <div
                                                    className="flex h-full min-w-1 items-center justify-end bg-blue-600 px-2 text-xs font-medium text-white"
                                                    style={{
                                                        width: `${(item.value / maxType) * 100}%`,
                                                    }}
                                                >
                                                    {item.value}
                                                </div>
                                            </div>
                                            <span className="font-semibold">
                                                {item.value}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Actividad diaria</CardTitle>
                            <CardDescription>
                                Casos registrados por día del mes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DailyBars data={byDay} month={selectedMonth} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Centros con más casos</CardTitle>
                            <CardDescription>
                                Centros que concentran más solicitudes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HorizontalBars
                                data={byCenter}
                                color="bg-emerald-600"
                                month={selectedMonth}
                            />
                        </CardContent>
                    </Card>
                </div>
                <AnalyticsExplorer
                    explorer={explorer}
                    selectedMonth={selectedMonth}
                />
            </div>
        </>
    );
}
function AnalyticsExplorer({
    explorer,
    selectedMonth,
}: {
    explorer: Props['explorer'];
    selectedMonth: string;
}) {
    const [saved, setSaved] = useState<
        { name: string; filters: ExplorerFilters }[]
    >(() => {
        try {
            return JSON.parse(
                localStorage.getItem('support-dashboard-views') ?? '[]',
            );
        } catch {
            return [];
        }
    });
    const saveView = () => {
        const name = window.prompt('Nombre para esta vista');

        if (!name?.trim()) {
            return;
        }

        const next = [
            ...saved.filter((item) => item.name !== name.trim()),
            { name: name.trim(), filters: explorer.filters },
        ];
        localStorage.setItem('support-dashboard-views', JSON.stringify(next));
        setSaved(next);
    };
    const openView = (filters: ExplorerFilters) =>
        router.get(dashboard().url, explorerQuery(selectedMonth, filters));
    const max = Math.max(...explorer.data.map((item) => item.value), 1);
    const palette = [
        '#2563eb',
        '#10b981',
        '#f97316',
        '#8b5cf6',
        '#ec4899',
        '#06b6d4',
        '#84cc16',
        '#64748b',
    ];
    let cursor = 0;
    const explorerTotal =
        explorer.data.reduce((sum, row) => sum + row.value, 0) || 1;
    const donut = explorer.data.length
        ? `conic-gradient(${explorer.data
              .map((item, index) => {
                  const start = cursor;
                  cursor += (item.value / explorerTotal) * 100;

                  return `${palette[index % palette.length]} ${start}% ${cursor}%`;
              })
              .join(',')})`
        : 'conic-gradient(#e5e7eb 0 100%)';

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle>Explorador de datos</CardTitle>
                        <CardDescription>
                            Arma un análisis sin modificar el dashboard
                            principal. No incluye información por técnico.
                        </CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={saveView}>
                        <Save />
                        Guardar vista
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form
                    {...dashboard.form()}
                    className="grid gap-3 md:grid-cols-3 xl:grid-cols-5"
                >
                    <input type="hidden" name="month" value={selectedMonth} />
                    <ExplorerField label="Desde">
                        <input
                            className={explorerInput}
                            type="date"
                            name="explorer_from"
                            defaultValue={explorer.filters.from}
                        />
                    </ExplorerField>
                    <ExplorerField label="Hasta">
                        <input
                            className={explorerInput}
                            type="date"
                            name="explorer_to"
                            defaultValue={explorer.filters.to}
                        />
                    </ExplorerField>
                    <ExplorerSelect
                        label="Estado"
                        name="explorer_status"
                        value={explorer.filters.status}
                        empty="Todos"
                        options={explorer.options.statuses}
                    />
                    <ExplorerSelect
                        label="Tipo"
                        name="explorer_type"
                        value={explorer.filters.type}
                        empty="Todos"
                        options={explorer.options.types}
                    />
                    <ExplorerSelect
                        label="Centro"
                        name="explorer_center"
                        value={explorer.filters.center}
                        empty="Todos"
                        options={explorer.options.centers}
                    />
                    <ExplorerSelect
                        label="Turno"
                        name="explorer_shift"
                        value={explorer.filters.shift}
                        empty="Todos"
                        options={explorer.options.shifts}
                    />
                    <ExplorerSelect
                        label="Agrupar por"
                        name="explorer_group"
                        value={explorer.filters.group}
                        options={['type', 'center', 'status', 'day', 'shift']}
                        labels={['Tipo', 'Centro', 'Estado', 'Día', 'Turno']}
                    />
                    <ExplorerSelect
                        label="Métrica"
                        name="explorer_metric"
                        value={explorer.filters.metric}
                        options={['count', 'average_time', 'resolution_rate']}
                        labels={[
                            'Cantidad de casos',
                            'Tiempo promedio',
                            'Tasa de resolución',
                        ]}
                    />
                    <ExplorerSelect
                        label="Visualización"
                        name="explorer_chart"
                        value={explorer.filters.chart}
                        options={['bar', 'donut', 'table']}
                        labels={['Barras', 'Dona', 'Tabla']}
                    />
                    <div className="flex items-end">
                        <Button className="w-full">Actualizar análisis</Button>
                    </div>
                </Form>
                {saved.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            Vistas guardadas:
                        </span>
                        {saved.map((item) => (
                            <div
                                key={item.name}
                                className="flex rounded-md border"
                            >
                                <button
                                    type="button"
                                    className="px-3 py-1.5 text-sm hover:bg-muted"
                                    onClick={() => openView(item.filters)}
                                >
                                    {item.name}
                                </button>
                                <button
                                    type="button"
                                    className="border-l px-2 hover:bg-muted"
                                    onClick={() => {
                                        const next = saved.filter(
                                            (row) => row.name !== item.name,
                                        );
                                        localStorage.setItem(
                                            'support-dashboard-views',
                                            JSON.stringify(next),
                                        );
                                        setSaved(next);
                                    }}
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {explorer.data.length === 0 ? (
                    <Empty />
                ) : explorer.filters.chart === 'table' ? (
                    <ExplorerTable data={explorer.data} explorer={explorer} />
                ) : explorer.filters.chart === 'donut' ? (
                    <div className="flex flex-col items-center gap-6 py-4 lg:flex-row lg:justify-center">
                        <div
                            className="size-56 rounded-full"
                            style={{ background: donut }}
                        />
                        <div className="grid gap-2">
                            {explorer.data.map((item, index) => (
                                <Link
                                    key={item.label}
                                    href={explorerHistoryUrl(
                                        explorer,
                                        item.label,
                                    )}
                                    className="flex min-w-64 justify-between gap-5 rounded p-1 hover:bg-muted"
                                >
                                    <span>
                                        <i
                                            className="mr-2 inline-block size-3 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    palette[
                                                        index % palette.length
                                                    ],
                                            }}
                                        />
                                        {item.label}
                                    </span>
                                    <b>
                                        {formatExplorerValue(
                                            item.value,
                                            explorer.filters.metric,
                                        )}
                                    </b>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {explorer.data.map((item) => (
                            <Link
                                key={item.label}
                                href={explorerHistoryUrl(explorer, item.label)}
                                className="grid grid-cols-[8rem_1fr_5rem] items-center gap-3 text-sm"
                            >
                                <span
                                    className="truncate text-right"
                                    title={item.label}
                                >
                                    {item.label}
                                </span>
                                <div className="h-8 rounded bg-muted">
                                    <div
                                        className="flex h-full min-w-1 items-center justify-end rounded bg-indigo-600 px-2 text-xs text-white"
                                        style={{
                                            width: `${(item.value / max) * 100}%`,
                                        }}
                                    >
                                        {formatExplorerValue(
                                            item.value,
                                            explorer.filters.metric,
                                        )}
                                    </div>
                                </div>
                                <span>{item.cases} {caseLabel(item.cases)}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
const explorerInput =
    'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm';
function ExplorerField({
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
function ExplorerSelect({
    label,
    name,
    value,
    options,
    labels,
    empty,
}: {
    label: string;
    name: string;
    value: string;
    options: string[];
    labels?: string[];
    empty?: string;
}) {
    return (
        <ExplorerField label={label}>
            <select className={explorerInput} name={name} defaultValue={value}>
                {empty !== undefined && <option value="">{empty}</option>}
                {options.map((option, index) => (
                    <option key={option} value={option}>
                        {labels?.[index] ?? option}
                    </option>
                ))}
            </select>
        </ExplorerField>
    );
}
function explorerQuery(month: string, filters: ExplorerFilters) {
    return {
        month,
        explorer_from: filters.from,
        explorer_to: filters.to,
        explorer_status: filters.status,
        explorer_type: filters.type,
        explorer_center: filters.center,
        explorer_shift: filters.shift,
        explorer_group: filters.group,
        explorer_metric: filters.metric,
        explorer_chart: filters.chart,
    };
}
function explorerHistoryUrl(explorer: Props['explorer'], label: string) {
    const f = explorer.filters;
    const params = new URLSearchParams({ date_from: f.from, date_to: f.to });

    if (f.status) {
        params.set('status', f.status);
    }

    if (f.type) {
        params.set('type', f.type);
    }

    if (f.center) {
        params.set('center', f.center);
    }

    if (f.shift) {
        params.set('shift', f.shift);
    }

    if (f.group === 'status') {
        params.set('status', label);
    }

    if (f.group === 'type') {
        params.set('type', label);
    }

    if (f.group === 'center') {
        params.set('center', label === 'Sin centro' ? '__empty__' : label);
    }

    if (f.group === 'shift') {
        params.set('shift', label);
    }

    if (f.group === 'day') {
        const [day, month, year] = label.split('/');
        params.set('date', `${year}-${month}-${day}`);
        params.delete('date_from');
        params.delete('date_to');
    }

    return `${supportCases().url}?${params}`;
}
function formatExplorerValue(value: number, metric: string) {
    return metric === 'average_time'
        ? `${value} min`
        : metric === 'resolution_rate'
          ? `${value}%`
          : String(value);
}
function ExplorerTable({
    data,
    explorer,
}: {
    data: ExplorerDatum[];
    explorer: Props['explorer'];
}) {
    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                    <tr>
                        <th className="p-3">Grupo</th>
                        <th className="p-3">Resultado</th>
                        <th className="p-3">Casos base</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.map((item) => (
                        <tr key={item.label}>
                            <td className="p-3">
                                <Link
                                    className="font-medium hover:underline"
                                    href={explorerHistoryUrl(
                                        explorer,
                                        item.label,
                                    )}
                                >
                                    {item.label}
                                </Link>
                            </td>
                            <td className="p-3">
                                {formatExplorerValue(
                                    item.value,
                                    explorer.filters.metric,
                                )}
                            </td>
                            <td className="p-3">{item.cases}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
function HorizontalBars({
    data,
    color,
    month,
}: {
    data: Datum[];
    color: string;
    month: string;
}) {
    const max = Math.max(...data.map((item) => item.value), 1);

    if (data.length === 0) {
        return <Empty />;
    }

    return (
        <div className="space-y-3">
            {data.map((item) => (
                <Link
                    key={item.label}
                    href={historyUrl(month, {
                        center:
                            item.label === 'Sin centro'
                                ? '__empty__'
                                : item.label,
                    })}
                    className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-sm"
                >
                    <span
                        className="truncate text-right text-muted-foreground"
                        title={item.label}
                    >
                        {item.label}
                    </span>
                    <div className="h-6 overflow-hidden rounded-sm bg-muted">
                        <div
                            className={'h-full min-w-1 ' + color}
                            style={{ width: (item.value / max) * 100 + '%' }}
                        />
                    </div>
                    <span className="font-semibold">{item.value}</span>
                </Link>
            ))}
        </div>
    );
}

function DailyBars({ data, month }: { data: Datum[]; month: string }) {
    const max = Math.max(...data.map((item) => item.value), 1);

    if (data.length === 0) {
        return <Empty />;
    }

    return (
        <div className="flex min-h-56 items-end gap-2 overflow-x-auto pt-6">
            {data.map((item) => (
                <Link
                    key={item.label}
                    href={`${supportCases().url}?${new URLSearchParams({ date: `${month}-${item.label.slice(0, 2)}` })}`}
                    className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2"
                >
                    <span className="text-xs font-semibold">{item.value}</span>
                    <div
                        className="w-full min-w-8 rounded-t bg-blue-600"
                        style={{
                            height: Math.max((item.value / max) * 150, 8),
                        }}
                        title={item.label + ': ' + item.value + ' ' + caseLabel(item.value)}
                    />
                    <span className="text-xs text-muted-foreground">
                        {item.label}
                    </span>
                </Link>
            ))}
        </div>
    );
}
function caseLabel(value: number) {
    return value === 1 ? 'caso' : 'casos';
}

function Metric({
    title,
    value,
    icon: Icon,
    tone,
    href,
    detail,
}: {
    title: string;
    value: number | string;
    icon: typeof BarChart3;
    tone: string;
    href: string;
    detail?: string;
}) {
    return (
        <Link
            href={href}
            className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
            <Card className="h-full gap-3 transition-colors hover:bg-muted/40">
                <CardHeader className="flex-row items-center justify-between">
                    <CardDescription>{title}</CardDescription>
                    <span className={`rounded-lg p-2 ${tone}`}>
                        <Icon className="size-5" />
                    </span>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tabular-nums">
                        {value}
                    </div>
                    {detail && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {detail}
                        </p>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
function Empty() {
    return (
        <div className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">
            No hay casos registrados en este mes.
        </div>
    );
}
Dashboard.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }] };
