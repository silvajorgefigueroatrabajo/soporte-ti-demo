import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
const DownloadSupportCasesController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DownloadSupportCasesController.url(options),
    method: 'get',
})

DownloadSupportCasesController.definition = {
    methods: ["get","head"],
    url: '/support-cases/download',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
DownloadSupportCasesController.url = (options?: RouteQueryOptions) => {
    return DownloadSupportCasesController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
DownloadSupportCasesController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DownloadSupportCasesController.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
DownloadSupportCasesController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DownloadSupportCasesController.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
    const DownloadSupportCasesControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: DownloadSupportCasesController.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
        DownloadSupportCasesControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: DownloadSupportCasesController.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\DownloadSupportCasesController::__invoke
 * @see app/Http/Controllers/DownloadSupportCasesController.php:37
 * @route '/support-cases/download'
 */
        DownloadSupportCasesControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: DownloadSupportCasesController.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })

    DownloadSupportCasesController.form = DownloadSupportCasesControllerForm
export default DownloadSupportCasesController
