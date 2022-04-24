// Shorter than calling multiple `query.indexOf` after transpiled
const indexOf = (word: string, char: string) => word.indexOf(char)

const getOperationIndex = (query: string) => {
	let index = indexOf(query, 'query')
	if (index > -1) return index + 6

	index = indexOf(query, 'mutation')
	if (index > -1) return index + 9

	index = indexOf(query, 'subscription')
	if (index > -1) return index + 13

	return -1
}

const getOperationDelimiter = (operationName: string) => {
	let bracketDelimiter = indexOf(operationName, '(')
	let spaceDelimiter = indexOf(operationName, ' ')

	// Only circumstance index is equal is that both is -1
	if (bracketDelimiter === spaceDelimiter) return -1

	return spaceDelimiter > bracketDelimiter ? bracketDelimiter : spaceDelimiter
}

export const getOperationName = (query: string) => {
	let opIndex = getOperationIndex(query)
	if (opIndex === -1) return '_'

	let operationName = query.substring(opIndex)

	let delimiterIndex = getOperationDelimiter(operationName)
	if (delimiterIndex === -1) return '_'

	return operationName.substring(0, delimiterIndex) || '_'
}
