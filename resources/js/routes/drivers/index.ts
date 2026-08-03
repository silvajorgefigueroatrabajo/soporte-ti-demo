import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\DriverController::importMethod
 * @see app/Http/Controllers/DriverController.php:40
 * @route '/drivers/import'
 */
export const importMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/drivers/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DriverController::importMethod
 * @see app/Http/Controllers/DriverController.php:40
 * @route '/drivers/import'
 */
importMethod.url = (options?: RouteQueryOptions) => {
    return importMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DriverController::importMethod
 * @see app/Http/Controllers/DriverController.php:40
 * @route '/drivers/import'
 */
importMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DriverController::importMethod
 * @see app/Http/Controllers/DriverController.php:40
 * @route '/drivers/import'
 */
    const importMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: importMethod.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DriverController::importMethod
 * @see app/Http/Controllers/DriverController.php:40
 * @route '/drivers/import'
 */
        importMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: importMethod.url(options),
            method: 'post',
        })

    importMethod.form = importMethodForm
/**
* @see \App\Http\Controllers\DriverController::index
 * @see app/Http/Controllers/DriverController.php:17
 * @route '/drivers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/drivers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DriverController::index
 * @see app/Http/Controllers/DriverController.php:17
 * @route '/drivers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DriverController::index
 * @see app/Http/Controllers/DriverController.php:17
 * @route '/drivers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DriverController::index
 * @see app/Http/Controllers/DriverController.php:17
 * @route '/drivers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DriverController::index
 * @see app/Http/Controllers/DriverController.php:17
 * @route '/drivers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DriverController::index
 * @see app/Http/Controllers/DriverController.php:17
 * @route '/drivers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DriverController::index
 * @see app/Http/Controllers/DriverController.php:17
 * @route '/drivers'
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
* @see \App\Http\Controllers\DriverController::store
 * @see app/Http/Controllers/DriverController.php:82
 * @route '/drivers'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/drivers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DriverController::store
 * @see app/Http/Controllers/DriverController.php:82
 * @route '/drivers'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DriverController::store
 * @see app/Http/Controllers/DriverController.php:82
 * @route '/drivers'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\DriverController::store
 * @see app/Http/Controllers/DriverController.php:82
 * @route '/drivers'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DriverController::store
 * @see app/Http/Controllers/DriverController.php:82
 * @route '/drivers'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })

    store.form = storeForm
/**
* @see \App\Http\Controllers\DriverController::update
 * @see app/Http/Controllers/DriverController.php:94
 * @route '/drivers/{driver}'
 */
export const update = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/drivers/{driver}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\DriverController::update
 * @see app/Http/Controllers/DriverController.php:94
 * @route '/drivers/{driver}'
 */
update.url = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { driver: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { driver: args.id }
        }

    if (Array.isArray(args)) {
        args = {
                    driver: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        driver: typeof args.driver === 'object'
                ? args.driver.id
                : args.driver,
                }

    return update.definition.url
            .replace('{driver}', parsedArgs.driver.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DriverController::update
 * @see app/Http/Controllers/DriverController.php:94
 * @route '/drivers/{driver}'
 */
update.put = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\DriverController::update
 * @see app/Http/Controllers/DriverController.php:94
 * @route '/drivers/{driver}'
 */
update.patch = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\DriverController::update
 * @see app/Http/Controllers/DriverController.php:94
 * @route '/drivers/{driver}'
 */
    const updateForm = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DriverController::update
 * @see app/Http/Controllers/DriverController.php:94
 * @route '/drivers/{driver}'
 */
        updateForm.put = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\DriverController::update
 * @see app/Http/Controllers/DriverController.php:94
 * @route '/drivers/{driver}'
 */
        updateForm.patch = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\DriverController::destroy
 * @see app/Http/Controllers/DriverController.php:113
 * @route '/drivers/{driver}'
 */
export const destroy = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/drivers/{driver}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DriverController::destroy
 * @see app/Http/Controllers/DriverController.php:113
 * @route '/drivers/{driver}'
 */
destroy.url = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { driver: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { driver: args.id }
        }

    if (Array.isArray(args)) {
        args = {
                    driver: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        driver: typeof args.driver === 'object'
                ? args.driver.id
                : args.driver,
                }

    return destroy.definition.url
            .replace('{driver}', parsedArgs.driver.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DriverController::destroy
 * @see app/Http/Controllers/DriverController.php:113
 * @route '/drivers/{driver}'
 */
destroy.delete = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\DriverController::destroy
 * @see app/Http/Controllers/DriverController.php:113
 * @route '/drivers/{driver}'
 */
    const destroyForm = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\DriverController::destroy
 * @see app/Http/Controllers/DriverController.php:113
 * @route '/drivers/{driver}'
 */
        destroyForm.delete = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })

    destroy.form = destroyForm
const drivers = {
    import: Object.assign(importMethod, importMethod),
index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default drivers
