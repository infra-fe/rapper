# `@rapper3/vue-query4`

> Based on [@tanstack/vue-query](https://tanstack.com/query/v4/docs/adapters/vue-query)

## Usage

[More Details](https://infra-fe.github.io/rap-client/code/vue/vue-query)

### 1. [Generate TS code](https://infra-fe.github.io/rap-client/code/http) in your project firstly

### 2. Then install `@rapper3/vue-query4`

```bash
yarn add @rapper3/vue-query4 @tanstack/vue-query
```

Or

```bash
npm i @rapper3/vue-query4 @tanstack/vue-query
```

## Usage

### Initial

```ts
// init.ts
import { createUseQuery, createUseInfiniteQuery } from '@rapper3/vue-query4';
import { IModels, http } from 'src/rapper';

export const useRapperQuery = createUseQuery<IModels>(http);
export const useRapperInfiniteQuery = createUseInfiniteQuery<IModels>(http);
```

### Basic

```jsx
<script setup>
import { useRapperQuery } from './init'
const { isLoading, isError, data } = useRapperQuery('POST/user/info', { age: 10 })
</script>

<template>
  <span v-if="isLoading">Loading...</span>
  <span v-else-if="isError">Error: {{ error.message }}</span>
  <!-- We can assume by this point that `isSuccess === true` -->
  <ul v-else>
    <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
  </ul>
</template>
```

### vue-query options

```jsx
<script setup>
import { ref, onMounted } from 'vue'
import { useRapperQuery } from './init'

const count = ref(0)

const { isLoading, isError, data } = useRapperQuery('POST/user/info', { age: 10 }, { enable: count.value > 11 })

function increment() {
  count.value++
}
</script>

<template>
  <span v-if="isLoading">Loading...</span>
  <span v-else-if="isError">Error: {{ error.message }}</span>
  <!-- We can assume by this point that `isSuccess === true` -->
  <ul v-else>
    <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
  </ul>
  <button @click="increment">Count is: {{ count }}</button>
</template>
```

## API

### useVueQuery

```ts
import { UseQueryOptions } from '@tanstack/vue-query';
import { IModels } from 'src/rapper';

function useVueQuery<T extends Exclude<keyof IModels, number | symbol>>(
  url: T,
  payload?: IModels[T]['Req'] | null,
  options?: Omit<
    UseQueryOptions<
      IModels[T]['Res'],
      unknown,
      IModels[T]['Res'],
      [T, IModels[T]['Req'] | null | undefined]
    >,
    'queryKey' | 'queryFn'
  >,
);
```

### useVueInfiniteQuery

```ts
import { UseInfiniteQueryOptions } from '@tanstack/vue-query';
import { IModels } from 'src/rapper';

function useVueInfiniteQuery<T extends Exclude<keyof IModels, number | symbol>>(
  url: T,
  payload?: IModels[T]['Req'] | null,
  options?: Omit<
    UseInfiniteQueryOptions<
      IModels[T]['Res'],
      unknown,
      IModels[T]['Res'],
      [T, IModels[T]['Req'] | null | undefined]
    >,
    'queryKey' | 'queryFn'
  >,
);
```
