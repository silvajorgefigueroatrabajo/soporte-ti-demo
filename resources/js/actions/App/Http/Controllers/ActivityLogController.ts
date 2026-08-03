import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ActivityLogController::__invoke
 * @see app/Http/Controllers/ActivityLogController.php:12
 * @route '/activity'
 */
const ActivityLogController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ActivityLogController.url(options),
    method: 'get',
})

ActivityLogController.definition = {
    methods: ["get","head"],
    url: '/activity',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ActivityLogController::__invoke
 * @see app/Http/Controllers/ActivityLogController.php:12
 * @route '/activity'
 */
ActivityLogController.url = (options?: RouteQueryOptions) => {
    return ActivityLogController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ActivityLogController::__invoke
 * @see app/Http/Controllers/ActivityLogController.php:12
 * @route '/activity'
 */
ActivityLogController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ActivityLogController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ActivityLogController::__invoke
 * @see app/Http/Controllers/ActivityLogController.php:12
 * @route '/activity'
 */
ActivityLogController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ActivityLogController.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ActivityLogController::__invoke
 * @see app/Http/Controllers/ActivityLogController.php:12
 * @route '/activity'
 */
    const ActivityLogControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: ActivityLogController.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ActivityLogController::__invoke
 * @see app/Http/Controllers/ActivityLogController.php:12
 * @route '/activity'
 */
        ActivityLogControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: ActivityLogController.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ActivityLogController::__invoke
 * @see app/Http/Controllers/ActivityLogController.php:12
 * @route '/activity'
 */
        ActivityLogControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: ActivityLogController.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })

    ActivityLogController.form = ActivityLogControllerForm
export default ActivityLogController
