import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    ClipboardPlus,
    Clock3,
    Headphones,
    ShieldCheck,
} from 'lucide-react';
import { dashboard, login } from '@/routes';
import type { User } from '@/types/auth';

type WelcomeProps = { auth: { user: User | null } };

export default function Welcome() {
    const { auth } = usePage<WelcomeProps>().props;
    const destination = auth.user ? dashboard() : login();

    return (
        <>
            <Head title="Sistema de Gestión de Soporte TI" />
            <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.16),transparent_28%),radial-gradient(circle_at_85%_30%,rgba(59,130,246,0.16),transparent_32%)]" />
                <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px] opacity-[0.035]" />

                <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 lg:px-10">
                    <header className="flex h-24 items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20">
                                <Headphones className="size-6" />
                            </div>
                            <div>
                                <div className="font-semibold tracking-tight">
                                    Sistema de Gestión de Soporte TI
                                </div>
                                <div className="text-xs text-slate-400">
                                    Demo operativa ficticia
                                </div>
                            </div>
                        </div>
                        <Link
                            href={destination}
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-medium transition hover:border-emerald-400/50 hover:bg-white/10"
                        >
                            {auth.user ? 'Ir al dashboard' : 'Iniciar sesión'}
                            <ArrowRight className="size-4" />
                        </Link>
                    </header>

                    <section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
                        <div className="max-w-2xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.9)]" />
                                Operación centralizada
                            </div>
                            <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight sm:text-6xl">
                                Cada caso visible.
                                <br />
                                <span className="text-emerald-400">
                                    Cada respuesta registrada.
                                </span>
                            </h1>
                            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                                Una plataforma simple para registrar atenciones,
                                seguir incidencias y entender la operación del
                                equipo de soporte en tiempo real.
                            </p>
                            <div className="mt-9 flex flex-wrap gap-3">
                                <Link
                                    href={destination}
                                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-emerald-400 px-6 text-sm font-semibold text-slate-950 shadow-xl shadow-emerald-500/15 transition hover:bg-emerald-300"
                                >
                                    {auth.user
                                        ? 'Abrir panel de control'
                                        : 'Ingresar al sistema'}
                                    <ArrowRight className="size-4" />
                                </Link>
                                {auth.user && (
                                    <Link
                                        href="/support-cases/create"
                                        className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-medium transition hover:bg-white/10"
                                    >
                                        <ClipboardPlus className="size-4" />
                                        Registrar caso
                                    </Link>
                                )}
                            </div>
                            <div className="mt-12 grid max-w-xl gap-4 sm:grid-cols-3">
                                <Feature
                                    icon={ClipboardPlus}
                                    title="Registro ágil"
                                    text="Datos ordenados"
                                />
                                <Feature
                                    icon={BarChart3}
                                    title="Visión mensual"
                                    text="Métricas claras"
                                />
                                <Feature
                                    icon={ShieldCheck}
                                    title="Trazabilidad"
                                    text="Usuario y horario"
                                />
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-xl">
                            <div className="absolute -inset-8 rounded-full bg-emerald-400/10 blur-3xl" />
                            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/85 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-7">
                                <div className="mb-7 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium tracking-widest text-slate-500 uppercase">
                                            Resumen operativo
                                        </p>
                                        <h2 className="mt-1 text-lg font-semibold">
                                            Actividad del equipo
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-2 rounded-lg bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">
                                        <span className="size-2 rounded-full bg-emerald-400" />
                                        En línea
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <Stat
                                        value="24"
                                        label="Casos"
                                        color="text-white"
                                    />
                                    <Stat
                                        value="19"
                                        label="Resueltos"
                                        color="text-emerald-400"
                                    />
                                    <Stat
                                        value="03"
                                        label="Escalados"
                                        color="text-orange-400"
                                    />
                                </div>
                                <div className="mt-7 rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                                    <div className="mb-5 flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            Incidencias por tipo
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Mes actual
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <Activity
                                            label="Sincronización"
                                            value="78%"
                                            width="78%"
                                        />
                                        <Activity
                                            label="Aplicación móvil"
                                            value="54%"
                                            width="54%"
                                        />
                                        <Activity
                                            label="Pedidos"
                                            value="36%"
                                            width="36%"
                                        />
                                        <Activity
                                            label="Documentos"
                                            value="22%"
                                            width="22%"
                                        />
                                    </div>
                                </div>
                                <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">
                                            <CheckCircle2 className="size-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">
                                                Seguimiento actualizado
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                Todos los casos sincronizados
                                            </div>
                                        </div>
                                    </div>
                                    <Clock3 className="size-4 text-slate-500" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <footer className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                            Sistema de Gestión de Soporte TI &middot; Registro y seguimiento
                            operacional
                        </span>
                        <span>Demostración pública con datos sintéticos</span>
                    </footer>
                </div>
            </main>
        </>
    );
}
function Feature({
    icon: Icon,
    title,
    text,
}: {
    icon: typeof ClipboardPlus;
    title: string;
    text: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-emerald-300">
                <Icon className="size-4" />
            </div>
            <div>
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs text-slate-500">{text}</div>
            </div>
        </div>
    );
}
function Stat({
    value,
    label,
    color,
}: {
    value: string;
    label: string;
    color: string;
}) {
    return (
        <div className="rounded-xl border border-white/8 bg-white/[0.035] p-4">
            <div className={`text-2xl font-semibold tabular-nums ${color}`}>
                {value}
            </div>
            <div className="mt-1 text-xs text-slate-500">{label}</div>
        </div>
    );
}
function Activity({
    label,
    value,
    width,
}: {
    label: string;
    value: string;
    width: string;
}) {
    return (
        <div className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3 text-xs">
            <span className="truncate text-slate-400">{label}</span>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                    style={{ width }}
                />
            </div>
            <span className="text-right text-slate-500">{value}</span>
        </div>
    );
}
