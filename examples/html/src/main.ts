import './style.css'

import gql, { client } from '@saltyaom/graphql'

client.config('http://localhost:8080/graphql')

window.addEventListener('DOMContentLoaded', () => {
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
	).then((data) => console.log(data))
})
