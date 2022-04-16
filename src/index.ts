import { client, getOperationName } from './services'

import type { GraphQLError, Options } from './types'

/**
 * SaltyAom's GraphQL
 *
 * Lightweight graphql client.
 *
 * Supports only query and mutation.
 *
 * @example
 * import gql, { client } from '@saltyaom/gql'
 *
 * client.config('https://api.opener.studio/graphql')
 *
 * gql(`
 *   query GetHentaiById($id: Int!) {
 *     getHentaiById(id: $id) {
 *       success
 *       data {
 *         title {
 *           display
 *         }
 *       }
 *     }
 *   }
 * `,
 * {
 *   variables: {
 *     id: 177013
 *   }
 * }).then((data) => console.log(data))
 **/
const gql = async <T extends Object = Object, V extends Object = Object>(
	query: string,
	{
		variables = {} as V,
		config = {},
		plugins = [],
		endpoint: customEndpoint
	}: Options<V> = {}
): Promise<T | GraphQLError[] | Error> => {
	let get = (
		typeof fetch == 'undefined' ? await import('isomorphic-unfetch') : fetch
	) as typeof fetch

	let { _e: endpoint, _h: headers, _p: basePlugins } = client
	let operationName = getOperationName(query)

	let _plugins = [...basePlugins, ...plugins]

	for (let plugin of _plugins)
		for (let middleware of plugin.middlewares || []) {
			let predefined = await middleware({
				operationName,
				variables,
				query
			})

			if (predefined) return predefined as T
		}

	try {
		/**
		 * Using Request so service worker can intercept the request
		 */
		let { data, errors = null } = await get(customEndpoint || endpoint, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				mode: 'cors',
				...headers.headers,
				...config.headers
			},
			...headers,
			...config,
			body: JSON.stringify({
				query,
				variables,
				operationName
			})
		}).then((res) => res.json())

		if (errors) throw errors

		for (let plugin of _plugins)
			for (let afterware of plugin.afterwares || [])
				data =
					(await afterware({
						data,
						operationName,
						variables,
						query
					})) || data

		return data
	} catch (error) {
		return error as Error
	}
}

export { client } from './services'

export type {
	Header,
	Operation,
	DataOperation,
	Middleware,
	Afterware,
	Plugin,
	GraphQLError
} from './types'
export default gql
