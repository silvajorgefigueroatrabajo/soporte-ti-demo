import { Head } from '@inertiajs/react';
import SupportCaseForm from '@/components/support-case-form';
import type { CaseValues } from '@/components/support-case-form';
import { edit, index, update } from '@/routes/support-cases';

type Options = {
    case_types: string[];
    statuses: string[];
    reporters: string[];
    drivers: string[];
    centers: string[];
    driver_centers: Record<string, string>;
};
type Props = {
    case: CaseValues & { id: number };
    technician: string;
    options: Options;
};
export default function SupportCaseEdit({
    case: supportCase,
    technician,
    options,
}: Props) {
    return (
        <>
            <Head title="Editar caso" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Editar caso #{supportCase.id}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Actualiza los datos de tu registro de soporte.
                    </p>
                </div>
                <SupportCaseForm
                    title="Datos del caso"
                    description="Solo el técnico propietario puede modificar este registro."
                    technician={technician}
                    options={options}
                    values={supportCase}
                    form={update.form(supportCase.id)}
                    cancelHref={index().url}
                />
            </div>
        </>
    );
}
SupportCaseEdit.layout = {
    breadcrumbs: [
        { title: 'Historial', href: index() },
        { title: 'Editar caso', href: edit(0) },
    ],
};
