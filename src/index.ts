import fetch from 'isomorphic-unfetch'
import type {
	GraphQLError,
	Options,
	Header,
	Plugin,
	ConfigOption
} from './types'

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
	config: (endpoint: string, option?: ConfigOption) => void
} = {
	_e: '',
	_h: {},
	_p: [],

	config: function (endpoint: string, { header = {}, plugins = [] } = {}) {
		this._e = endpoint
		this._h = header
		this._p = plugins
	}
}

export const getOperationName = (query: string) => {
	let [_, __, operationName] =
		query.match(/(query|mutation|subscription) (.*?) {/) ||
		([false, '', ''] as const)

	return operationName.split('(')[0] || '_'
}

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
		endpoint: customEndpoint,
		method = 'POST'
	}: Options<V> = {}
): Promise<T | GraphQLError[] | Error> => {
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
		let { data, errors = null } = await fetch(customEndpoint || endpoint, {
			method,
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
