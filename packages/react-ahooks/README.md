# `@rapper3/react-ahooks`

> Based on [ahooks](https://ahooks.js.org/zh-CN/hooks/use-request/index)

## Usage

### 1. [Generate TS code](https://infra-fe.github.io/rap-client/code/react) in your project firstly

### 2. Then install `@rapper3/react-ahooks`

```sh
yarn add @rapper3/react-ahooks ahooks
```

Or

```bash
npm i @rapper3/request @rapper3/react-ahooks ahooks
```

### 3. `useHttp`

```tsx
import { useHttp } from 'src/rapper';
function App() {
  const { data, loading, refresh } = useHttp('POST/user/info/header', {
    token: 'token',
    name: 'name222',
  });
  return <>{loading ? <p>loading...</p> : data ? <p>{data}</p> : <p>No Data</p>}</>;
}
```

More details: [Rapper react hooks](https://infra-fe.github.io/rap-client/code/react)
