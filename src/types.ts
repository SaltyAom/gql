/**
 * Append HTTP Header that will sent with request
 */
export type Header = Omit<RequestInit, 'body'>

export interface Operation<V extends Object = Object> {
	operationName: string
	variables: V
	query: string
}
export interface DataOperation<
	T extends Object = Object,
	V extends Object = Object
> extends Operation<V> {
	data: T
}

export type Middleware<T extends Object = Object, V extends Object = Object> = (
	operation: Operation<V>
) => T | Promise<T> | undefined | null | void

export type Afterware<T extends Object = Object, V extends Object = Object> = (
	opeartion: DataOperation<T, V>
) => T | Promise<T> | undefined | null | void

export interface Plugin<T extends Object = Object, V extends Object = Object> {
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
}

export interface GraphQLError {
	message: string
	locations: {
		line: number
		column: number
	}
}

export interface ConfigOption {
	header?: Header
	plugins?: Plugin[]
}

export interface Options<V extends Object = Object> {
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
	 * Custom endpoint
	 *
	 * @default ''
	 */
	endpoint?: string
	/**
	 * Custom Method
	 */
	method?: string
}
