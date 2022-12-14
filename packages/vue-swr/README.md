# @rapper3/vue-swr

Based on [vue swrv](https://docs-swrv.netlify.app/guide/getting-started.html)

## Usage

### 1. [Generate TS code](https://infra-fe.github.io/rap-client/code/http) in your project firstly

### 2. Then install `@rapper3/vue-swr`

```sh
yarn add @rapper3/vue-swr
```

### 3. `createSwrv` and `useSwr`

```ts
import { defineComponent, ref } from "vue";
import { createSwrv } from '@rapper3/vue-swr';
import { Models, http } from 'src/rapper';

const useSwr = createSwrv<Models>(http);

export default defineComponent({
  setup() {
    const { data, isValidating, error } = useSwr('POST/user/info', { name: 'swr_name', age: 10 });
    const mutate = useMutate();
    return (
      <>
        <h3>React SWR</h3>
        <button
          loading={isValidating}
          onClick={() => mutate('POST/user/info')}
        >
          Refresh
        </button>
        {data && <pre>{JSON.stringify(data?.data || [], null, 2)}</pre>}
        {error && `Error...`}
      </>
  }
});

```

More details, Pls refer [HERE](https://infra-fe.github.io/rap-client/code/react/react-swr)
