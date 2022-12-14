# @rapper3/react-swr

Based on [swr](https://swr.vercel.app/zh-CN)

## Usage

### 1. [Generate TS code](https://infra-fe.github.io/rap-client/code/http) in your project firstly

### 2. Install `@rapper3/react-swr`

```sh
yarn add @rapper3/react-swr
```

### 3. `createSwr` and `useSwr`

```ts
import React from 'react';
import { Button } from 'antd';
import { createSwr, createUseMutate } from '@rapper3/react-swr';
import { Models, http } from 'src/rapper';

const useSwr = createSwr<Models>(http);
const useMutate = createUseMutate<Models>();

export default () => {
  const { data, isValidating, error } = useSwr('POST/user/info', { name: 'swr_name', age: 10 });
  const mutate = useMutate();
  return (
    <>
      <h3>React SWR</h3>
      <Button
        loading={isValidating}
        disabled={isValidating}
        type="primary"
        onClick={() => mutate('POST/user/info')}
      >
        Refresh
      </Button>
      {data && <pre>{JSON.stringify(data?.data || [], null, 2)}</pre>}
      {error && `Error...`}
    </>
  );
};
```

More details, Pls refer [HERE](https://infra-fe.github.io/rap-client/code/react/react-swr)
