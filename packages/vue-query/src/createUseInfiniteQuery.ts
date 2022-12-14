import { useInfiniteQuery } from '@tanstack/vue-query';

import type { UseInfiniteQueryOptions } from '@tanstack/vue-query';

export function createUseInfiniteQuery<
  IModels extends Record<
    Exclude<keyof IModels, number | symbol>,
    {
      Req: Record<string, unknown>;
      Res: Record<string, unknown>;
    }
  >,
>(fetcher: (...args: any[]) => Promise<any>) {
  function useVueQuery<T extends Exclude<keyof IModels, number | symbol>>(
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
  ) {
    return useInfiniteQuery<
      IModels[T]['Res'],
      unknown,
      IModels[T]['Res'],
      [T, IModels[T]['Req'] | null | undefined]
    >(
      [url, payload],
      ({ queryKey, signal }) => fetcher(queryKey[0], queryKey[1], { signal }),
      options,
    );
  }
  return useVueQuery;
}
