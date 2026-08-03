import { Head } from '@inertiajs/react';
import SupportCaseForm from '@/components/support-case-form';
import type { CaseValues } from '@/components/support-case-form';
import { create, index, store } from '@/routes/support-cases';

type Options = {
    case_types: string[];
    statuses: string[];
    reporters: string[];
    drivers: string[];
    centers: string[];
    driver_centers: Record<string, string>;
};
type LastCase = Pick<
    CaseValues,
    | 'reporter'
    | 'driver'
    | 'center'
    | 'case_type'
    | 'description'
    | 'observations'
>;
type Props = {
    technician: string;
    shift: string | null;
    options: Options;
    lastCase: LastCase | null;
};
export default function SupportCaseCreate({
    technician,
    shift,
    options,
    lastCase,
}: Props) {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    return (
        <>
            <Head title="Registrar caso" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Registrar caso
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Registra una atenci&oacute;n de soporte realizada
                        durante tu turno.
                    </p>
                </div>
                <SupportCaseForm
                    title="Datos del caso"
                    description="El técnico corresponde al usuario de la sesión. Comunicador, conductor, centro y tipo admiten valores nuevos. El transporte se registra solo en este caso."
                    technician={technician}
                    options={options}
                    values={{
                        reported_date: localDate.toISOString().slice(0, 10),
                        reported_time: localDate.toISOString().slice(11, 16),
                        resolved_time: null,
                        shift: shift ?? '',
                        reporter: null,
                        driver: null,
                        center: null,
                        case_type: '',
                        description: '',
                        status: '',
                        observations: null,
                        transport: null,
                    }}
                    form={store.form()}
                    cancelHref={index().url}
                    resetOnSuccess
                    lastCase={lastCase}
                />
            </div>
        </>
    );
}
SupportCaseCreate.layout = {
    breadcrumbs: [{ title: 'Registrar caso', href: create() }],
};
