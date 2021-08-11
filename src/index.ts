const isServer = typeof window == 'undefined'

type Header = Omit<RequestInit, 'body'>
type Middleware<T extends Object = Object, V extends Object = Object> = (
	operationName: string,
	variables: V
) => T | undefined | null | void
type Afterware<T extends Object = Object, V extends Object = Object> = (
	data: T,
	operationName: string,
	variables: V
) => T | undefined | null | void

export interface GraphQLError {
	message: string
	locations: {
		line: number
		column: number
	}
}

class Config {
	private _endpoint = ''
	private _headers: Header = {}
	private _middlewares: Middleware[] = []
	private _afterwares: Afterware[] = []

	/**
	 * Config GraphQL client
	 *
	 * @param endpoint {string} query URL destination
	 * @param headers {Object} default `fetch` header
	 */
	config(
		endpoint: string,
		headers: Header = {},
		{
			middlewares = [],
			afterwares = []
		}: {
			middlewares: Middleware[]
			afterwares: Afterware[]
		} = { middlewares: [], afterwares: [] }
	) {
		this._endpoint = endpoint
		this._headers = headers
		this._middlewares = middlewares
		this._afterwares = afterwares
	}

	get cfg() {
		return [
			this._endpoint,
			this._headers,
			this._middlewares,
			this._afterwares
		] as const
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
	 * Array of callback to be executed before the data is fetched
	 *
	 * Recommended for logging purpose
	 *
	 * @default []
	 */
	middlewares?: Middleware<T, V>[]
	/**
	 * Array of callback to be executed after the data is fetched
	 *
	 * Recommended for logging purpose
	 *
	 * @default []
	 */
	afterwares?: Afterware<T, V>[]
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
const gql = async <T extends Object = Object, V extends Object = Object>(
	query: string,
	{
		variables = {} as V,
		config = {},
		middlewares = [],
		afterwares = [],
		minify: min = true
	}: Options<T, V>
): Promise<T | GraphQLError[] | Error> => {
	let get = (
		isServer ? await import('isomorphic-unfetch') : fetch
	) as typeof fetch

	let [endpoint, headers, baseMiddlewares, baseAfterwares] = client.cfg
	let operationName = getOperationName(query)

	let _middlewares =
		middlewares || (baseMiddlewares as unknown as Middleware<T, V>[])
	let _afterwares =
		afterwares || (baseAfterwares as unknown as Afterware<T, V>[])

	for (let middleware of _middlewares) {
		let predefined = middleware(operationName, variables)

		if (predefined) return predefined
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

		for (let afterware of _afterwares)
			data = afterware(data, operationName, variables) || data

		return data
	} catch (error) {
		return error
	}
}

export default gql
