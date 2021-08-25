import type { Header, Plugin, GraphQLError } from './types'

/**
 * GraphQL Client
 *
 * You can config client option here
 *
 * @example
 * import gql, { config } from '@saltyaom/gq'
 *
 * client.config('http://api.opener.studio/graphql')
 **/
export const client: {
	_e: string
	_h: Header
	_p: Plugin[]
	config: (endpoint: string, header?: Header, plugins?: Plugin[]) => void
} = {
	_e: '',
	_h: {},
	_p: [],

	config: function (
		endpoint: string,
		header: Header = {},
		plugins: Plugin[] = []
	) {
		this._e = endpoint
		this._h = header
		this._p = plugins
	}
}

const getOperationName = (query: string) => {
	let [_, __, operationName] =
		query.match(/(query|mutation|subscription) (.*?) {/) ||
		([false, '', ''] as const)

	return operationName.split('(')[0] || '_'
}

const minify = (query: string) => {
	let [header, ...restQuery] = query.split(/{/)

	return `${header}{${restQuery
		.join('{')
		.replace(/\ /g, '')
		.replace(/\n/g, ' ')}`
}

interface Options<V extends Object = Object> {
	/**
	 * GraphQL variables
	 *
	 * @default {}
	 */
	variables?: V
	/**
	 * `fetch` config
	 *
	 * @default {}
	 */
	config?: Header
	/**
	 * Plugins
	 */
	plugins?: Plugin[]
	/**
	 * Minify query
	 *
	 * @default true
	 */
	minify?: boolean
}

/**
 * SaltyAom's GraphQL
 *
 * Lightweight graphql client, minify query on fly.
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
		minify: min = true
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
		let { data, errors = null } = await get(endpoint, {
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
				query: min ? minify(query) : query,
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
		return error
	}
}

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
