import { Head } from '@inertiajs/react';
import GuideForm from '@/components/guide-form';
import { create, index, store } from '@/routes/guides';

export default function GuideCreate({ categories }: { categories: string[] }) {
    return (
        <>
            <Head title="Crear guía" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Crear guía
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Comparte una solución que pueda ayudar a otros técnicos.
                    </p>
                </div>
                <GuideForm
                    title="Nueva guía"
                    description="Explica el problema y deja un procedimiento claro y reproducible."
                    values={{
                        title: '',
                        category: null,
                        summary: null,
                        content: '',
                    }}
                    categories={categories}
                    form={store.form()}
                    cancelHref={index().url}
                />
            </div>
        </>
    );
}

GuideCreate.layout = {
    breadcrumbs: [
        { title: 'Guías', href: index() },
        { title: 'Crear guía', href: create() },
    ],
};
