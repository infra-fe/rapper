import type { UseQueryOptions } from '@tanstack/vue-query';
import { useQuery } from '@tanstack/vue-query';

export function createUseQuery<
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
      UseQueryOptions<
        IModels[T]['Res'],
        unknown,
        IModels[T]['Res'],
        [T, IModels[T]['Req'] | null | undefined]
      >,
      'queryKey' | 'queryFn'
    >,
  ) {
    return useQuery<
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
