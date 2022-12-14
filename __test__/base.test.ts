// import type { Expect, Equal, ExpectExtends } from '@type-challenges/utils'
// import { createFetch } from './rapper/current';
// import type { IModels } from './rapper/current/request';

// type Fetch = ReturnType<typeof createFetch>
// type RequestParamaters<T extends keyof Fetch> = Parameters<Fetch[T]>[0]
// type Response<T extends keyof Fetch> = ReturnType<Fetch[T]> extends Promise<infer U> ? U : never

// export type Cases = [
//   Expect<ExpectExtends<keyof Fetch, 'POST/admin/node/new'>>,
//   Expect<Equal<RequestParamaters<'POST/admin/node/new'>, IModels['POST/admin/node/new']['Req']>>,
//   Expect<Equal<Response<'POST/admin/node/new'>, IModels['POST/admin/node/new']['Res']>>,
// ]

it('has correct type definition', async () => {
  // createFetch({}, { fetchType: 1 });
})
