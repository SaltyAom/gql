import './style.css'

import gql, { client } from '@saltyaom/graphql'

client.config('https://api.opener.studio/graphql', undefined, [
	{
		afterwares: [
			({ data, operationName, variables }) => {
				console.log('Logger:', data, operationName, variables)
			}
		]
	}
])

gql(
	`query GetHentaiById($id: Int!) {
      getHentaiById(id: $id) {
        success
        data {
          title {
            display
          }
        }
      }
    }
  `,
	{
		variables: {
			id: 177013
		}
	}
)