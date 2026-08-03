import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
export const download = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(options),
    method: 'get',
})

download.definition = {
    methods: ["get","head"],
    url: '/support-cases/download',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
download.url = (options?: RouteQueryOptions) => {
    return download.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
download.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
download.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: download.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
    const downloadForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: download.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
        downloadForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: download.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
        downloadForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: download.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })

    download.form = downloadForm
/**
* @see \App\Http\Controllers\SupportCaseController::similar
 * @see app/Http/Controllers/SupportCaseController.php:21
 * @route '/support-cases/similar'
 */
export const similar = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: similar.url(options),
    method: 'get',
})

similar.definition = {
    methods: ["get","head"],
    url: '/support-cases/similar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportCaseController::similar
 * @see app/Http/Controllers/SupportCaseController.php:21
 * @route '/support-cases/similar'
 */
similar.url = (options?: RouteQueryOptions) => {
    return similar.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportCaseController::similar
 * @see app/Http/Controllers/SupportCaseController.php:21
 * @route '/support-cases/similar'
 */
similar.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: similar.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportCaseController::similar
 * @see app/Http/Controllers/SupportCaseController.php:21
 * @route '/support-cases/similar'
 */
similar.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: similar.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportCaseController::similar
 * @see app/Http/Controllers/SupportCaseController.php:21
 * @route '/support-cases/similar'
 */
    const similarForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: similar.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportCaseController::similar
 * @see app/Http/Controllers/SupportCaseController.php:21
 * @route '/support-cases/similar'
 */
        similarForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: similar.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportCaseController::similar
 * @see app/Http/Controllers/SupportCaseController.php:21
 * @route '/support-cases/similar'
 */
        similarForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: similar.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })

    similar.form = similarForm
/**
* @see \App\Http\Controllers\SupportCaseController::index
 * @see app/Http/Controllers/SupportCaseController.php:64
 * @route '/support-cases'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/support-cases',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportCaseController::index
 * @see app/Http/Controllers/SupportCaseController.php:64
 * @route '/support-cases'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportCaseController::index
 * @see app/Http/Controllers/SupportCaseController.php:64
 * @route '/support-cases'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportCaseController::index
 * @see app/Http/Controllers/SupportCaseController.php:64
 * @route '/support-cases'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportCaseController::index
 * @see app/Http/Controllers/SupportCaseController.php:64
 * @route '/support-cases'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportCaseController::index
 * @see app/Http/Controllers/SupportCaseController.php:64
 * @route '/support-cases'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportCaseController::index
 * @see app/Http/Controllers/SupportCaseController.php:64
 * @route '/support-cases'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })

    index.form = indexForm
/**
* @see \App\Http\Controllers\SupportCaseController::create
 * @see app/Http/Controllers/SupportCaseController.php:135
 * @route '/support-cases/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/support-cases/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportCaseController::create
 * @see app/Http/Controllers/SupportCaseController.php:135
 * @route '/support-cases/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportCaseController::create
 * @see app/Http/Controllers/SupportCaseController.php:135
 * @route '/support-cases/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportCaseController::create
 * @see app/Http/Controllers/SupportCaseController.php:135
 * @route '/support-cases/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportCaseController::create
 * @see app/Http/Controllers/SupportCaseController.php:135
 * @route '/support-cases/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportCaseController::create
 * @see app/Http/Controllers/SupportCaseController.php:135
 * @route '/support-cases/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportCaseController::create
 * @see app/Http/Controllers/SupportCaseController.php:135
 * @route '/support-cases/create'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })

    create.form = createForm
/**
* @see \App\Http\Controllers\SupportCaseController::store
 * @see app/Http/Controllers/SupportCaseController.php:149
 * @route '/support-cases'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/support-cases',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SupportCaseController::store
 * @see app/Http/Controllers/SupportCaseController.php:149
 * @route '/support-cases'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportCaseController::store
 * @see app/Http/Controllers/SupportCaseController.php:149
 * @route '/support-cases'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SupportCaseController::store
 * @see app/Http/Controllers/SupportCaseController.php:149
 * @route '/support-cases'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SupportCaseController::store
 * @see app/Http/Controllers/SupportCaseController.php:149
 * @route '/support-cases'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })

    store.form = storeForm
/**
* @see \App\Http\Controllers\SupportCaseController::edit
 * @see app/Http/Controllers/SupportCaseController.php:167
 * @route '/support-cases/{support_case}/edit'
 */
export const edit = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/support-cases/{support_case}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SupportCaseController::edit
 * @see app/Http/Controllers/SupportCaseController.php:167
 * @route '/support-cases/{support_case}/edit'
 */
edit.url = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { support_case: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { support_case: args.id }
        }

    if (Array.isArray(args)) {
        args = {
                    support_case: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        support_case: typeof args.support_case === 'object'
                ? args.support_case.id
                : args.support_case,
                }

    return edit.definition.url
            .replace('{support_case}', parsedArgs.support_case.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportCaseController::edit
 * @see app/Http/Controllers/SupportCaseController.php:167
 * @route '/support-cases/{support_case}/edit'
 */
edit.get = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SupportCaseController::edit
 * @see app/Http/Controllers/SupportCaseController.php:167
 * @route '/support-cases/{support_case}/edit'
 */
edit.head = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SupportCaseController::edit
 * @see app/Http/Controllers/SupportCaseController.php:167
 * @route '/support-cases/{support_case}/edit'
 */
    const editForm = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SupportCaseController::edit
 * @see app/Http/Controllers/SupportCaseController.php:167
 * @route '/support-cases/{support_case}/edit'
 */
        editForm.get = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SupportCaseController::edit
 * @see app/Http/Controllers/SupportCaseController.php:167
 * @route '/support-cases/{support_case}/edit'
 */
        editForm.head = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })

    edit.form = editForm
/**
* @see \App\Http\Controllers\SupportCaseController::update
 * @see app/Http/Controllers/SupportCaseController.php:178
 * @route '/support-cases/{support_case}'
 */
export const update = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/support-cases/{support_case}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\SupportCaseController::update
 * @see app/Http/Controllers/SupportCaseController.php:178
 * @route '/support-cases/{support_case}'
 */
update.url = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { support_case: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { support_case: args.id }
        }

    if (Array.isArray(args)) {
        args = {
                    support_case: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        support_case: typeof args.support_case === 'object'
                ? args.support_case.id
                : args.support_case,
                }

    return update.definition.url
            .replace('{support_case}', parsedArgs.support_case.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportCaseController::update
 * @see app/Http/Controllers/SupportCaseController.php:178
 * @route '/support-cases/{support_case}'
 */
update.put = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\SupportCaseController::update
 * @see app/Http/Controllers/SupportCaseController.php:178
 * @route '/support-cases/{support_case}'
 */
update.patch = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\SupportCaseController::update
 * @see app/Http/Controllers/SupportCaseController.php:178
 * @route '/support-cases/{support_case}'
 */
    const updateForm = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SupportCaseController::update
 * @see app/Http/Controllers/SupportCaseController.php:178
 * @route '/support-cases/{support_case}'
 */
        updateForm.put = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\SupportCaseController::update
 * @see app/Http/Controllers/SupportCaseController.php:178
 * @route '/support-cases/{support_case}'
 */
        updateForm.patch = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })

    update.form = updateForm
/**
* @see \App\Http\Controllers\SupportCaseController::destroy
 * @see app/Http/Controllers/SupportCaseController.php:198
 * @route '/support-cases/{support_case}'
 */
export const destroy = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/support-cases/{support_case}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SupportCaseController::destroy
 * @see app/Http/Controllers/SupportCaseController.php:198
 * @route '/support-cases/{support_case}'
 */
destroy.url = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { support_case: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { support_case: args.id }
        }

    if (Array.isArray(args)) {
        args = {
                    support_case: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        support_case: typeof args.support_case === 'object'
                ? args.support_case.id
                : args.support_case,
                }

    return destroy.definition.url
            .replace('{support_case}', parsedArgs.support_case.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SupportCaseController::destroy
 * @see app/Http/Controllers/SupportCaseController.php:198
 * @route '/support-cases/{support_case}'
 */
destroy.delete = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\SupportCaseController::destroy
 * @see app/Http/Controllers/SupportCaseController.php:198
 * @route '/support-cases/{support_case}'
 */
    const destroyForm = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SupportCaseController::destroy
 * @see app/Http/Controllers/SupportCaseController.php:198
 * @route '/support-cases/{support_case}'
 */
        destroyForm.delete = (args: { support_case: number | { id: number } } | [support_case: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })

    destroy.form = destroyForm
const supportCases = {
    download: Object.assign(download, download),
similar: Object.assign(similar, similar),
index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default supportCases
