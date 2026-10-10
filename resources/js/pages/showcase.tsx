import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Delivery = { id: string; date: string; center: string; status: string };
const initialDeliveries: Delivery[] = Array.from({ length: 30 }, (_, i) => ({
    id: `DEMO-${String(i + 1).padStart(3, '0')}`,
    date: `2026-10-${String(1 + (i % 10)).padStart(2, '0')}`,
    center: ['Centro Norte Demo', 'Centro Sur Demo'][i % 2],
    status: i % 5 === 0 ? 'Pendiente' : 'Entregado',
}));
const initialMessages = [
    {
        id: 1,
        author: 'Alex Demo',
        text: 'No puedo sincronizar la aplicación del vehículo DEMO-001.',
    },
    {
        id: 2,
        author: 'Sam Demo',
        text: 'Necesito revisar un documento de la entrega DEMO-008.',
    },
    {
        id: 3,
        author: 'Robin Demo',
        text: 'La sesión de prueba expiró al ingresar al sistema.',
    },
];

export default function Showcase() {
    const [tab, setTab] = useState<'analytics' | 'messages'>('analytics');
    const [deliveries, setDeliveries] = useState(initialDeliveries);
    const [center, setCenter] = useState('');
    const [from, setFrom] = useState('2026-10-01');
    const [to, setTo] = useState('2026-10-10');
    const [states, setStates] = useState<Record<number, string>>({});
    const [notice, setNotice] = useState('');
    const [csv, setCsv] = useState(
        'id,date,center,status\nDEMO-031,2026-10-10,Centro Norte Demo,Entregado',
    );
    const rows = useMemo(
        () =>
            deliveries.filter(
                (row) =>
                    (!center || row.center === center) &&
                    row.date >= from &&
                    row.date <= to,
            ),
        [deliveries, center, from, to],
    );
    const delivered = rows.filter((row) => row.status === 'Entregado').length;
    function importRows() {
        const lines = csv.trim().split(/\r?\n/);

        if (lines.shift()?.trim() !== 'id,date,center,status') {
            setNotice(
                'Utiliza el encabezado de la plantilla: id,date,center,status.',
            );

            return;
        }

        const incoming = lines.map((line) => {
            const [id, date, center, status] = line
                .split(',')
                .map((value) => value.trim());

            return { id, date, center, status };
        });

        if (
            !incoming.length ||
            incoming.some(
                (row) =>
                    !row.id?.startsWith('DEMO-') ||
                    !/^2026-\d{2}-\d{2}$/.test(row.date ?? '') ||
                    !['Centro Norte Demo', 'Centro Sur Demo'].includes(
                        row.center,
                    ) ||
                    !['Entregado', 'Pendiente'].includes(row.status),
            )
        ) {
            setNotice(
                'Revisa los registros: usa identificadores DEMO-, fechas 2026 y los centros y estados de la plantilla.',
            );

            return;
        }

        const ids = new Set(deliveries.map((row) => row.id));
        const unique = incoming.filter((row) => {
            if (ids.has(row.id)) {
                return false;
            }

            ids.add(row.id);

            return true;
        });
        setDeliveries([...deliveries, ...unique]);
        setNotice(
            `${unique.length} registros añadidos; ${incoming.length - unique.length} duplicados omitidos.`,
        );
    }

    return (
        <>
            <Head title="Laboratorio demostrativo" />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-8">
                <header>
                    <p className="text-sm font-medium text-muted-foreground">
                        Portafolio · Datos ficticios
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold">
                        Soporte y analítica operacional
                    </h1>
                    <p className="mt-3 max-w-3xl text-muted-foreground">
                        Explora los conceptos del proyecto con información
                        sintética. Este laboratorio funciona en el navegador: no
                        conecta con Teams ni Drivin, no envía mensajes y se
                        reinicia al recargar. El módulo de soporte del menú
                        conserva su flujo completo.
                    </p>
                </header>
                <nav
                    className="flex flex-wrap gap-3"
                    aria-label="Módulos de demostración"
                >
                    <Button
                        variant={tab === 'analytics' ? 'default' : 'outline'}
                        onClick={() => setTab('analytics')}
                    >
                        Analítica e importación
                    </Button>
                    <Button
                        variant={tab === 'messages' ? 'default' : 'outline'}
                        onClick={() => setTab('messages')}
                    >
                        Bandeja de mensajes
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setDeliveries(initialDeliveries);
                            setStates({});
                            setNotice('Demostración restablecida.');
                        }}
                    >
                        Restablecer demo
                    </Button>
                </nav>
                {tab === 'analytics' ? (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Explorar entregas ficticias
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-4">
                                <label className="grid gap-2 text-sm">
                                    Centro
                                    <select
                                        className="rounded-md border bg-background p-2"
                                        value={center}
                                        onChange={(event) =>
                                            setCenter(event.target.value)
                                        }
                                    >
                                        <option value="">Todos</option>
                                        <option>Centro Norte Demo</option>
                                        <option>Centro Sur Demo</option>
                                    </select>
                                </label>
                                <label className="grid gap-2 text-sm">
                                    Desde
                                    <input
                                        className="rounded-md border p-2"
                                        type="date"
                                        value={from}
                                        onChange={(event) =>
                                            setFrom(event.target.value)
                                        }
                                    />
                                </label>
                                <label className="grid gap-2 text-sm">
                                    Hasta
                                    <input
                                        className="rounded-md border p-2"
                                        type="date"
                                        value={to}
                                        min={from}
                                        onChange={(event) =>
                                            setTo(event.target.value)
                                        }
                                    />
                                </label>
                            </CardContent>
                        </Card>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                ['Entregas filtradas', rows.length],
                                ['Entregadas', delivered],
                                [
                                    'Cumplimiento',
                                    `${rows.length ? Math.round((delivered / rows.length) * 100) : 0}%`,
                                ],
                            ].map(([label, value]) => (
                                <Card key={label}>
                                    <CardContent className="p-6">
                                        <p className="text-sm text-muted-foreground">
                                            {label}
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold">
                                            {value}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Importación demostrativa con deduplicación
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Pega registros ficticios en formato CSV
                                    simple, sin comas dentro de los campos. La
                                    implementación original procesa Excel; esta
                                    muestra permite probar validación y
                                    deduplicación sin cargar archivos
                                    operacionales.
                                </p>
                                <label className="grid gap-2 text-sm">
                                    Registros de prueba
                                    <textarea
                                        className="min-h-28 rounded-md border p-3 font-mono text-sm"
                                        value={csv}
                                        onChange={(event) =>
                                            setCsv(event.target.value)
                                        }
                                    />
                                </label>
                                <Button className="w-fit" onClick={importRows}>
                                    Validar e importar muestra
                                </Button>
                            </CardContent>
                        </Card>
                        <div className="overflow-x-auto rounded-xl border">
                            <table className="w-full text-left text-sm">
                                <caption className="p-3 text-left text-muted-foreground">
                                    Detalle de los registros filtrados
                                </caption>
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        {[
                                            'Identificador',
                                            'Fecha',
                                            'Centro',
                                            'Estado',
                                        ].map((label) => (
                                            <th className="p-3" key={label}>
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr className="border-b" key={row.id}>
                                            <td className="p-3">{row.id}</td>
                                            <td className="p-3">{row.date}</td>
                                            <td className="p-3">
                                                {row.center}
                                            </td>
                                            <td className="p-3">
                                                {row.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!rows.length && (
                                <p className="p-4 text-sm">
                                    No hay registros para estos filtros.
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <section className="grid gap-4">
                        <h2 className="text-xl font-semibold">
                            Flujo inspirado en una bandeja de Teams
                        </h2>
                        <p className="text-muted-foreground">
                            Mensajes de ejemplo para mostrar revisión,
                            asociación y descarte. Las acciones de esta muestra
                            no crean casos reales.
                        </p>
                        {initialMessages.map((message) => (
                            <Card key={message.id}>
                                <CardContent className="grid gap-3 p-6">
                                    <p className="font-semibold">
                                        {message.author}
                                    </p>
                                    <p>{message.text}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Estado:{' '}
                                        {states[message.id] ??
                                            'Pendiente de revisión'}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            disabled={!!states[message.id]}
                                            onClick={() =>
                                                setStates({
                                                    ...states,
                                                    [message.id]: `Asociado al caso ficticio CASO-DEMO-${message.id}`,
                                                })
                                            }
                                        >
                                            Simular asociación a caso
                                        </Button>
                                        <Button
                                            variant="outline"
                                            disabled={!!states[message.id]}
                                            onClick={() =>
                                                setStates({
                                                    ...states,
                                                    [message.id]:
                                                        'Descartado en la demostración',
                                                })
                                            }
                                        >
                                            Descartar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </section>
                )}
                <p
                    role="status"
                    aria-live="polite"
                    className="text-sm font-medium"
                >
                    {notice}
                </p>
            </main>
        </>
    );
}

Showcase.layout = {
    breadcrumbs: [{ title: 'Laboratorio demostrativo', href: '/showcase' }],
};
