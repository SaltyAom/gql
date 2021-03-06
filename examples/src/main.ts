import gql, { client } from '@saltyaom/gql'
import LocalCache from '@saltyaom/gql-local-cache'
import InMemoryCache from '@saltyaom/gql-inmemory-cache'

client.config('https://api.hifumin.app', {
	plugins: [InMemoryCache(), LocalCache()]
})

const runQuery = () => {
	console.log('Run Query')

	return gql(
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
}

runQuery().then(runQuery)
