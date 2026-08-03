import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\CenterController::index
 * @see app/Http/Controllers/CenterController.php:17
 * @route '/centers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/centers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CenterController::index
 * @see app/Http/Controllers/CenterController.php:17
 * @route '/centers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CenterController::index
 * @see app/Http/Controllers/CenterController.php:17
 * @route '/centers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CenterController::index
 * @see app/Http/Controllers/CenterController.php:17
 * @route '/centers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CenterController::index
 * @see app/Http/Controllers/CenterController.php:17
 * @route '/centers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CenterController::index
 * @see app/Http/Controllers/CenterController.php:17
 * @route '/centers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CenterController::index
 * @see app/Http/Controllers/CenterController.php:17
 * @route '/centers'
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
* @see \App\Http\Controllers\CenterController::store
 * @see app/Http/Controllers/CenterController.php:43
 * @route '/centers'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/centers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CenterController::store
 * @see app/Http/Controllers/CenterController.php:43
 * @route '/centers'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CenterController::store
 * @see app/Http/Controllers/CenterController.php:43
 * @route '/centers'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CenterController::store
 * @see app/Http/Controllers/CenterController.php:43
 * @route '/centers'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CenterController::store
 * @see app/Http/Controllers/CenterController.php:43
 * @route '/centers'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })

    store.form = storeForm
/**
* @see \App\Http\Controllers\CenterController::update
 * @see app/Http/Controllers/CenterController.php:59
 * @route '/centers/{center}'
 */
export const update = (args: { center: number | { id: number } } | [center: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/centers/{center}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\CenterController::update
 * @see app/Http/Controllers/CenterController.php:59
 * @route '/centers/{center}'
 */
update.url = (args: { center: number | { id: number } } | [center: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { center: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { center: args.id }
        }

    if (Array.isArray(args)) {
        args = {
                    center: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        center: typeof args.center === 'object'
                ? args.center.id
                : args.center,
                }

    return update.definition.url
            .replace('{center}', parsedArgs.center.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CenterController::update
 * @see app/Http/Controllers/CenterController.php:59
 * @route '/centers/{center}'
 */
update.put = (args: { center: number | { id: number } } | [center: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\CenterController::update
 * @see app/Http/Controllers/CenterController.php:59
 * @route '/centers/{center}'
 */
update.patch = (args: { center: number | { id: number } } | [center: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\CenterController::update
 * @see app/Http/Controllers/CenterController.php:59
 * @route '/centers/{center}'
 */
    const updateForm = (args: { center: number | { id: number } } | [center: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CenterController::update
 * @see app/Http/Controllers/CenterController.php:59
 * @route '/centers/{center}'
 */
        updateForm.put = (args: { center: number | { id: number } } | [center: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\CenterController::update
 * @see app/Http/Controllers/CenterController.php:59
 * @route '/centers/{center}'
 */
        updateForm.patch = (args: { center: number | { id: number } } | [center: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\CenterController::destroy
 * @see app/Http/Controllers/CenterController.php:81
 * @route '/centers/{center}'
 */
export const destroy = (args: { center: number | { id: number } } | [center: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/centers/{center}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\CenterController::destroy
 * @see app/Http/Controllers/CenterController.php:81
 * @route '/centers/{center}'
 */
destroy.url = (args: { center: number | { id: number } } | [center: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { center: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { center: args.id }
        }

    if (Array.isArray(args)) {
        args = {
                    center: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        center: typeof args.center === 'object'
                ? args.center.id
                : args.center,
                }

    return destroy.definition.url
            .replace('{center}', parsedArgs.center.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CenterController::destroy
 * @see app/Http/Controllers/CenterController.php:81
 * @route '/centers/{center}'
 */
destroy.delete = (args: { center: number | { id: number } } | [center: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\CenterController::destroy
 * @see app/Http/Controllers/CenterController.php:81
 * @route '/centers/{center}'
 */
    const destroyForm = (args: { center: number | { id: number } } | [center: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CenterController::destroy
 * @see app/Http/Controllers/CenterController.php:81
 * @route '/centers/{center}'
 */
        destroyForm.delete = (args: { center: number | { id: number } } | [center: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })

    destroy.form = destroyForm
const centers = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default centers
