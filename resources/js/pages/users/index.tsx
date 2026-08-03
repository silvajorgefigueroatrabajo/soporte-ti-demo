import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, PlusCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    is_admin: boolean;
    shift: string | null;
    active: boolean;
    last_login_at: string | null;
};
type Props = { users: User[]; roles: string[]; shifts: string[] };
const field = 'h-9 rounded-md border border-input bg-transparent px-3 text-sm';
export default function UsersIndex({ users, roles, shifts }: Props) {
    return (
        <>
            <Head title="Usuarios" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Usuarios y accesos
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Crea cuentas, asigna turnos y controla quién puede
                        ingresar.
                    </p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Nueva cuenta</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action="/users"
                            method="post"
                            resetOnSuccess
                            className="grid gap-3 md:grid-cols-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Input
                                        name="name"
                                        placeholder="Nombre"
                                        required
                                    />
                                    <Input
                                        name="email"
                                        type="email"
                                        placeholder="Correo"
                                        required
                                    />
                                    <Input
                                        name="password"
                                        type="password"
                                        placeholder="Contraseña inicial"
                                        required
                                    />
                                    <Select name="role" options={roles} />
                                    <Select
                                        name="shift"
                                        options={shifts}
                                        empty="Sin turno"
                                    />
                                    <div className="flex items-center justify-between md:col-span-5">
                                        <p className="text-xs text-destructive">
                                            {Object.values(errors)[0]}
                                        </p>
                                        <Button disabled={processing}>
                                            {processing ? (
                                                <LoaderCircle className="animate-spin" />
                                            ) : (
                                                <PlusCircle />
                                            )}
                                            Crear usuario
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
                <div className="grid gap-4">
                    {users.map((user) => (
                        <Card key={user.id}>
                            <CardContent className="pt-6">
                                <Form
                                    action={`/users/${user.id}`}
                                    method="put"
                                    className="grid gap-3 md:grid-cols-6"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <Input
                                                name="name"
                                                defaultValue={user.name}
                                                required
                                            />
                                            <Input
                                                name="email"
                                                type="email"
                                                defaultValue={user.email}
                                                required
                                            />
                                            {user.is_admin ? (
                                                <>
                                                    <input
                                                        type="hidden"
                                                        name="role"
                                                        value="technician"
                                                    />
                                                    <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-medium">
                                                        Administrador
                                                    </div>
                                                </>
                                            ) : (
                                                <Select
                                                    name="role"
                                                    value={user.role}
                                                    options={roles}
                                                />
                                            )}
                                            <Select
                                                name="shift"
                                                value={user.shift ?? ''}
                                                options={shifts}
                                                empty="Sin turno"
                                            />
                                            {user.is_admin ? (
                                                <>
                                                    <input
                                                        type="hidden"
                                                        name="active"
                                                        value="1"
                                                    />
                                                    <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm">
                                                        Activo protegido
                                                    </div>
                                                </>
                                            ) : (
                                                <select
                                                    name="active"
                                                    defaultValue={
                                                        user.active ? '1' : '0'
                                                    }
                                                    className={field}
                                                >
                                                    <option value="1">
                                                        Activo
                                                    </option>
                                                    <option value="0">
                                                        Desactivado
                                                    </option>
                                                </select>
                                            )}
                                            <Input
                                                name="password"
                                                type="password"
                                                placeholder="Nueva contraseña (opcional)"
                                            />
                                            <div className="flex items-center justify-between gap-3 md:col-span-6">
                                                <p className="text-xs text-muted-foreground">
                                                    Último acceso:{' '}
                                                    {user.last_login_at
                                                        ? new Date(
                                                              user.last_login_at,
                                                          ).toLocaleString(
                                                              'es-CL',
                                                          )
                                                        : 'Sin registro'}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-destructive">
                                                        {
                                                            Object.values(
                                                                errors,
                                                            )[0]
                                                        }
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        disabled={processing}
                                                    >
                                                        {processing ? (
                                                            <LoaderCircle className="animate-spin" />
                                                        ) : (
                                                            <Save />
                                                        )}
                                                        Guardar
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}
function Select({
    name,
    options,
    value = '',
    empty,
}: {
    name: string;
    options: string[];
    value?: string;
    empty?: string;
}) {
    return (
        <select name={name} defaultValue={value} className={field}>
            {empty !== undefined && <option value="">{empty}</option>}
            {options.map((option) => (
                <option key={option} value={option}>
                    {option === 'technician'
                        ? 'Técnico'
                        : option === 'observer'
                          ? 'Observador'
                          : option}
                </option>
            ))}
        </select>
    );
}
UsersIndex.layout = { breadcrumbs: [{ title: 'Usuarios', href: '/users' }] };
