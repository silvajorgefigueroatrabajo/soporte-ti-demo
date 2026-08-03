import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
export const show = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/guide-images/{guideImage}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
show.url = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return show.definition.url
            .replace('{guideImage}', parsedArgs.guideImage.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
show.get = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
show.head = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
    const showForm = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
        showForm.get = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\GuideImageController::__invoke
 * @see app/Http/Controllers/GuideImageController.php:10
 * @route '/guide-images/{guideImage}'
 */
        showForm.head = (args: { guideImage: number | { id: number } } | [guideImage: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })

    show.form = showForm
const guideImages = {
    show: Object.assign(show, show),
}

export default guideImages
