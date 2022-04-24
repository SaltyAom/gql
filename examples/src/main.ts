import gql, { client } from '@saltyaom/gql'

client.config('https://api.hifumin.app/graphql')

const runQuery = () =>
	gql(
		`query SaltyAomGQL($id: Int!) {
  		  nhql {
  		    by(id: $id) {
  		      success
  		      error
  		      data {
  		        id
  		        title {
  		          display
  		        }
  		      }
  		    }
  		  }
  		}`,
		{
			variables: {
				id: 177013
			}
		}
	).then(console.log)

runQuery()
