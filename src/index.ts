const isServer = typeof window == 'undefined'

type Header = Omit<RequestInit, 'body'>

class Config {
	private _endpoint = ''
	private _headers: Header = {}

	/**
	 * Config GraphQL client
	 *
	 * @param endpoint {string} query URL destination
	 * @param headers {Object} default `fetch` header
	 */
	config(endpoint: string, headers: Header = {}) {
		this._endpoint = endpoint
		this._headers = headers
	}

	get cfg() {
		return [this._endpoint, this._headers] as const
	}
}

export const client = new Config()

const getOperationName = (query: string) => {
	let [_, __, operationName] =
		query.match(/(query|mutation|subscription) (.*?) {/) ||
		([false, '', ''] as const)

	return operationName.split('(')[0]
}

const minify = (query: string) => {
	let [header, ...restQuery] = query.split(/{/)

	return `${header}{${restQuery
		.join('{')
		.replace(/\ /g, '')
		.replace(/\n/g, ' ')}`
}

interface Options<T extends Object = Object, V extends Object = Object> {
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
	 * Custom middleware
	 *
	 * @default null
	 */
	middlewares?: ((data: T, operationName: string, variables: V) => T)[] | null
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
 * import gql, { client } from '@saltyaom/graphql'
 *
 * client.config('http://api.opener.studio/graphql')
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
const gql = async <T extends Object = Object>(
	query: string,
	{
		variables = {},
		config = {},
		middlewares = null,
		minify: min = true
	}: Options<T>
): Promise<T | Error> => {
	let get = (
		isServer ? await import('isomorphic-unfetch') : fetch
	) as typeof fetch

	let [endpoint, headers] = client.cfg
	let operationName = getOperationName(query)

	console.log({
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
	})

	try {
		let data: T = await get(endpoint, {
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

		if (middlewares)
			for (let middleware of middlewares)
				data = middleware(data, operationName, variables) || data

		return data
	} catch (error) {
		return error
	}
}

export default gql
