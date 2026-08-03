import { Form, Head, Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Log = {
    id: number;
    user: string;
    action: string;
    description: string;
    created_at: string;
};
type Props = {
    logs: {
        data: Log[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search: string };
};
export default function ActivityIndex({ logs, filters }: Props) {
    return (
        <>
            <Head title="Bitácora" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Bitácora de actividad
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Cambios importantes e ingresos registrados en el
                        sistema.
                    </p>
                </div>
                <Form
                    action="/activity"
                    method="get"
                    className="flex max-w-2xl gap-2"
                >
                    <Input
                        name="search"
                        defaultValue={filters.search}
                        placeholder="Buscar actividad"
                    />
                    <Button>
                        <Search />
                        Buscar
                    </Button>
                </Form>
                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50 text-left">
                            <tr>
                                <th className="p-3">Fecha</th>
                                <th className="p-3">Usuario</th>
                                <th className="p-3">Acción</th>
                                <th className="p-3">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {logs.data.map((log) => (
                                <tr key={log.id}>
                                    <td className="p-3 whitespace-nowrap">
                                        {log.created_at}
                                    </td>
                                    <td className="p-3 font-medium">
                                        {log.user}
                                    </td>
                                    <td className="p-3 capitalize">
                                        {log.action}
                                    </td>
                                    <td className="p-3">{log.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.data.length === 0 && (
                        <p className="p-10 text-center text-muted-foreground">
                            No hay actividad para mostrar.
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap gap-1">
                    {logs.links.map((link, index) =>
                        link.url ? (
                            <Button
                                key={index}
                                size="sm"
                                variant={link.active ? 'default' : 'outline'}
                                asChild
                            >
                                <Link
                                    href={link.url}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            </Button>
                        ) : (
                            <Button
                                key={index}
                                size="sm"
                                variant="outline"
                                disabled
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ),
                    )}
                </div>
            </div>
        </>
    );
}
ActivityIndex.layout = {
    breadcrumbs: [{ title: 'Bitácora', href: '/activity' }],
};
