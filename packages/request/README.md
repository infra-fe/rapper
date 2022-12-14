# `@rapper3/request`

> Based on [axios](https://github.com/axios/axios)

**Connect with Rap, Pls see [rap generate code](https://infra-fe.github.io/rap-client/code) firstly!**

## Install

```bash
yarn add @rapper3/request
```

Or

```bash
npm i @rapper3/request
```

## Usage

```tsx
import { useEffect } from 'react';
import { http, fetch } from 'src/rapper';
function App() {
  async function fetchData() {
    const data = await http('POST/user/info/header', {
      token: 'token',
      name: 'name222',
    });
    // or
    // const data = await fetch['POST/user/info/header']({
    //   token: 'token',
    //   name: 'name222',
    // });
  }
  return (
    <>
      <button onClick={() => fetchData()}>fetch</button>
    </>
  );
}
```

More details: [Rapper http](https://infra-fe.github.io/rap-client/code/http)
