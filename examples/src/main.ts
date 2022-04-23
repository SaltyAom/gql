import './style.css'

import gql, { client } from '@saltyaom/gql'

client.config('https://api.opener.studio/graphql', {
	plugins: [
		{
			afterwares: [
				({ data, operationName, variables }) => {
					console.log('Logger:', data, operationName, variables)
				}
			]
		}
	]
})

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
).then((a) => console.log(a))
