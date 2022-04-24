import fetch from 'isomorphic-unfetch'

import { getOperationName } from './services'
import type {
	GraphQLError,
	Options,
	FetchConfig,
	Plugin,
	ConfigOption,
	Configure,
	Client,
	CreateClient
} from './types'

/**
 * Create custom client instance
 *
 * You can config client option here
 *
 * @example
 * import gql, { createClient } from '@saltyaom/gq'
 *
 * const client = createClient('http://api.opener.studio/graphql')
 **/

export const createClient: CreateClient = (
	endpoint,
	{ config = {}, plugins = [], timeout = 5000 } = {}
) => {
	const client: Client = {
		_e: '',
		_c: {},
		_p: [],
		_t: 10000,

		config: function (
			endpoint,
			{ config = {}, plugins = [], timeout = 10000 } = {}
		) {
			this._e = endpoint
			this._c = config
			this._p = plugins
			this._t = timeout
		}
	}

	return client
}

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
const defaultClient = createClient('')
export { defaultClient as client }

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
 * client.config('https://api.hifumin.app/graphql')
 *
 * gql(`
 *   query GetHentaiById($id: Int!) {
 *     getHentaiById(id: $id) {
 *       success
 *       data {
 *         id
 *         title {
 *           display
 *         }
 *       }
 *     }
 *   }`,
 * {
 *   client,
 *   variables: {
 *     id: 177013
 *   }
 * }).then((data) => console.log(data))
 **/
const gql = async <T extends Object = Object, V extends Object = Object>(
	query: string,
	{
		client = defaultClient,
		variables = {} as V,
		config = {},
		plugins = [],
		endpoint: customEndpoint,
		method = 'POST'
	}: Options<V> = {}
): Promise<T | GraphQLError[] | Error> => {
	let { _e: endpoint, _c: fetchConfig, _p: basePlugins } = client
	let operationName = getOperationName(query)

	let _plugins = basePlugins.concat(plugins)
	let fromCache: T | null = null

	const runAfterware = async (rawData: T | null, fromCache = false) => {
		let data = rawData

		for (let plugin of _plugins)
			for (let afterware of plugin.afterwares || []) {
				let mutated = await afterware({
					data,
					operationName,
					variables,
					query,
					fromCache
				})

				if (mutated) data = mutated as T
			}

		return data
	}

	for (let plugin of _plugins)
		for (let middleware of plugin.middlewares || []) {
			let predefined = await middleware({
				operationName,
				variables,
				query
			})

			// ? All middleware must be executed to prevent request blocking
			if (!fromCache && predefined) fromCache = predefined as T
		}

	if (fromCache) return (await runAfterware(fromCache, true)) as T

	try {
		let controller = new AbortController()

		let timeout: number | null = null
		if (config.timeout)
			timeout = setTimeout(() => {
				controller.abort()
				throw new Error('Request timeout')
			}, config.timeout) as unknown as number

		let { data, errors = null } = await fetch(customEndpoint || endpoint, {
			method,
			...fetchConfig,
			...config,
			headers: {
				'content-type': 'application/json',
				...fetchConfig.headers,
				...config.config?.headers
			},
			signal: controller.signal,
			body: JSON.stringify({
				query,
				variables,
				operationName
			})
		}).then((res) => {
			if (timeout) clearTimeout(timeout)

			return res.json()
		})

		await runAfterware(data)

		if (errors) throw errors

		return data
	} catch (error) {
		await runAfterware(null)

		return error as Error
	}
}

export type {
	GraphQLError,
	Options,
	FetchConfig,
	Plugin,
	ConfigOption,
	Configure,
	Client,
	CreateClient
} from './types'
export default gql
