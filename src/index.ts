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
		e: '',
		c: {},
		p: [],
		t: 10000,

		config: function (
			endpoint,
			{ config = {}, plugins = [], timeout = 10000 } = {}
		) {
			this.e = endpoint
			this.c = config
			this.p = plugins
			this.t = timeout
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

const hashTable: Record<string, number> = {}

// https://stackoverflow.com/a/52171480
export const hash = (s: string) => {
	let h = 9

	for (let i = 0; i < s.length; ) h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9)

	return h = h ^ (h >>> 9)
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
	let { e: endpoint, c: fetchConfig, p: basePlugins } = client

	let runAfterware = async (rawData: T | null, fromCache = false) => {
		let data = rawData

		for (let plugin of _plugins)
			for (let afterware of plugin.afterwares || []) {
				let mutated = await afterware({
					hash: checksum,
					data,
					variables,
					query,
					fromCache
				})

				if (mutated) data = mutated as T
			}

		return data
	}

	let _plugins = basePlugins.concat(plugins)
	let checksum = hash(query + variables)

	for (let plugin of _plugins)
		for (let middleware of plugin.middlewares || []) {
			let cache = await middleware({
				hash: checksum,
				variables,
				query
			})

			if (cache) return (await runAfterware(cache as T, true)) as T
		}

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
				operationName: getOperationName(query)
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
