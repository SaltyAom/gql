# @saltyaom/gql
Lightweight graphql client.

## Feature
- No dependencies.
- Lightweight, just 1.4 KB.
- Run on both client and server.
- Just simple fetch.
- You can write plugins, eg.
  - [@saltyaom/gql-inmemory-cache](https://github.com/saltyaom/gql-inmemory-cache)
  - [@saltyaom/gql-local-cache](https://github.com/saltyaom/gql-local-cache)
- Built-in TypeScript

## Size
1.2 is around 1.4 KB, checkout [Bundlephobia](https://bundlephobia.com/package/@saltyaom/gql) for accurate result.

## Getting start
```bash
pnpm add @saltyaom/gql
```

## Example
```jsx
import gql, { client } from '@saltyaom/gql'

client.config('https://api.hifumin.app/graphql')

gql(
  `query SaltyAomGQL($id: Int!) {
      nhql {
        by(id: $id) {
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
```

## Why
Y'll made GraphQL too complex and heavy.

I just want to fetch GraphQL query here.


## Plugins
You can implement custom plugin for transforming data, caching, logging, etc.

- middlewares
	- Executes before fetch
	- Will receive (`operationName`, `variables`)
	- If any callback return truthy value, the value will be used as result and skip the fetch
	- Good for caching

- afterwares
	- Executes after fetch
	- Will receive (`data`, `operationName`, `variables`)
	- Returning new data will cause data transformation for next afterware
	- Good for logging, data-transformations.

### Example
```typescript
import gql, { client } from '@saltyaom/gql'
import LocalCache from '@saltyaom/gql-local-cache'

client.config(
  'https://api.opener.studio/graphql', 
  {
    plugins: [
      LocalCache(),
      // Or write your own plugins
      {
          afterwares: [
          ({ data, operationName, variables }) => {
            console.log('Logger:', data, operationName, variables)
          }
        ]
      }
    ]
  }
)

// You can pass generic if you're using TypeScript
gql<ReturnType, VariableType>(
  `query SaltyAomGQL($id: Int!) {
      nhql {
        by(id: $id) {
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
).then((data) => {
  console.log(data)
})
```