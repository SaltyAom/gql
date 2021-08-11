import './style.css'

import gql, { client } from '@saltyaom/graphql'

client.config('http://localhost:8080/graphql')

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
		},
		afterwares: [
			(data, operation, variables) => {
				console.log("A", data, operation, variables)
			}
		]
	}
).then((data) => console.log(data))
