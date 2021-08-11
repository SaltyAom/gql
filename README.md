# @saltyaom/graphql
Lightweight graphql client, minify query on fly.

## Feature
- No dependencies.
- Lightweight, just 600 bytes.
- Supports on both client and server.
- Just simple fetch.
- Minify query on flies
- Middleware and Afterware
- Built-in TypeScript

## Size
Should be around 600 bytes, checkout [Bundlephobia](https://bundlephobia.com/package/@saltyaom/gql) for accurate result.

## Getting start
```bash
yarn add @saltyaom/gql

// Or npm
npm install @saltyaom/gql --save
```

## Example
```jsx
import gql, { client } from '@saltyaom/graphql'

client.config('http://api.opener.studio/graphql')

gql(`
  query GetHentaiById($id: Int!) {
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
}).then((data) => console.log(data))
```

## Why
Y'll made GraphQL too complex and heavy.

I just want to fetch GraphQL query here.

## Middleware
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
import gql, { client } from '@saltyaom/graphql'

client.config('http://api.opener.studio/graphql')

gql(`
  query GetHentaiById($id: Int!) {
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
  afterwares: (data, operation, variables) => {
    console.log(data, operation, variables)
  }
}).then((data) => console.log(data))
```