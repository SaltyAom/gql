import './style.css'

import gql, { client } from '@saltyaom/graphql'

client.config('http://api.opener.studio/graphql')

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
