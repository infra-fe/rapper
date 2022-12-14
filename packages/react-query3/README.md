# @rapper3/react-query3

Combine Rapper3 with powerful React Query.

## Getting Started

---

### 1. Install [Rapper3 http](https://infra-fe.github.io/rap-client/code/http), [React Query](https://react-query.tanstack.com/) and `@rapper3/react-query3` in your project.

```sh
npm install --save @rapper3/cli @rapper3/request react-query@^3 @rapper3/react-query3
```

[Generate TypeScript code](https://infra-fe.github.io/rap-client/code/react/react-query) in your project.

Remember to add `QueryClientProvider`. ([React Query Quick Start](https://react-query.tanstack.com/quick-start))

```tsx
import { QueryClient, QueryClientProvider } from 'react-query';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  );
}
```

Create the hooks using generated code.

```tsx
import * as React from 'react';
import { createUseRapperQuery } from '@rapper3/react-query3';
import { fetch } from 'src/rapper';

const useRapperQuery = createUseRapperQuery(fetch);

const Component: React.FC = () => {
  const { data, isLoading } = useRapperQuery('GET/path/to/your/api', {
    param1: 'value',
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>{data.data}</div>;
};
```

## API Reference

- [Rapper](https://infra-fe.github.io/rap-client/code)
- [React Query](https://react-query.tanstack.com/overview)

### createUseRapperQuery

Combine Rapper with `useQuery` in `react-query`. It's usually used for read-only APIs (GET method).

- `url: string`: The URL of your API.
- `params?: object`: The params of your API.
- `options?: UseQueryOptions`: The options for `useQuery`.

### createUseRapperQueries

Combine Rapper with `useQueries` in `react-query`. Most time, you can use several `useQuery` to fetch multiple APIs. Use `useQueries` if your count of requests is undetermined.

- `requests: [string, object][]`
  - `requests[number][0]`: The URL of your API.
  - `requests[number][1]`: The params of your API.
- `options?: QueriesOptions`: The options for `useQueries`.

### createUseMutation

Combine Rapper with `useMutation` in `react-query`. It's usually used for mutation APIs (POST/PUT/PATCH/DELETE method).

- `url: string`: The URL of your API.
- `options?: UseMutationOptions`: The options for `useMutation`.

### createUseInfiniteQuery

Combine Rapper with `useInfiniteQuery` in `react-query`. It's usually used for infinite pagination APIs. For normal page/number paginations, you can just use a `useQuery`.

- `url: string`: The URL of your API.
- `params?: object`: The params of your API.
- `options?: UseInfinityQueryOptions`: The options for `useInfinityQuery`.
