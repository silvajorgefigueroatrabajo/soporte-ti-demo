import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
const GuideImageController = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: GuideImageController.url(args, options),
    method: 'get',
})

GuideImageController.definition = {
    methods: ["get","head"],
    url: '/guide-images/{guideImage}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
GuideImageController.url = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { guideImage: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { guideImage: args.id }
        }

    if (Array.isArray(args)) {
        args = {
                    guideImage: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        guideImage: typeof args.guideImage === 'object'
                ? args.guideImage.id
                : args.guideImage,
                }

    return GuideImageController.definition.url
            .replace('{guideImage}', parsedArgs.guideImage.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
GuideImageController.get = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: GuideImageController.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
GuideImageController.head = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: GuideImageController.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
    const GuideImageControllerForm = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: GuideImageController.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
        GuideImageControllerForm.get = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: GuideImageController.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
        GuideImageControllerForm.head = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: GuideImageController.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })

    GuideImageController.form = GuideImageControllerForm
export default GuideImageController
