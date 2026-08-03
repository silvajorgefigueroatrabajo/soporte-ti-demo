import { Head } from '@inertiajs/react';
import GuideForm from '@/components/guide-form';
import type { GuideValues } from '@/components/guide-form';
import { edit, index, show, update } from '@/routes/guides';

type Props = {
    guide: GuideValues & { id: number };
    categories: string[];
};

export default function GuideEdit({ guide, categories }: Props) {
    return (
        <>
            <Head title="Editar guía" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Editar guía
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Mantén el procedimiento actualizado para todo el equipo.
                    </p>
                </div>
                <GuideForm
                    title={guide.title}
                    description="Actualiza la información necesaria y guarda los cambios."
                    values={guide}
                    categories={categories}
                    form={update.form(guide.id)}
                    cancelHref={show(guide.id).url}
                />
            </div>
        </>
    );
}

GuideEdit.layout = {
    breadcrumbs: [
        { title: 'Guías', href: index() },
        { title: 'Editar guía', href: edit(0) },
    ],
};
