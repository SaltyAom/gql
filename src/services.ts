import type { Header, Plugin, ConfigOption } from './types'

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
	config: (endpoint: string, option: ConfigOption) => void
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
