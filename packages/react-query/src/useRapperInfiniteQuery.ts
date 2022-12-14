import { IHttpRequest } from '@rapper3/request';
import {
  QueryFunctionContext,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { AxiosConfig } from './types';

export function createUseRapperInfiniteQuery<
  IModels extends Record<
    Exclude<keyof IModels, number | symbol>,
    {
      Req: unknown;
      Res: unknown;
    }
  >,
  Data = any,
>(http: IHttpRequest<IModels, Data>, config?: Omit<AxiosConfig<Data>, 'method' | 'url'>) {
  const queryFn = ({
    queryKey,
    pageParam,
  }: QueryFunctionContext<[keyof IModels, IModels[keyof IModels]['Req']]>) =>
    http(
      queryKey[0],
      {
        ...(queryKey[1] as object),
        ...pageParam,
      },
      config,
    );

  function useRapperInfiniteQuery<TKey extends keyof IModels, TError = unknown>(
    url: TKey,
    params?: IModels[keyof IModels]['Req'],
    options?: Omit<
      UseInfiniteQueryOptions<
        IModels[TKey]['Res'],
        TError,
        IModels[TKey]['Res'],
        IModels[TKey]['Res'],
        [TKey, IModels[keyof IModels]['Req']]
      >,
      'queryKey' | 'queryFn'
    >,
  ) {
    return useInfiniteQuery<
      IModels[TKey]['Res'],
      TError,
      IModels[TKey]['Res'],
      [TKey, IModels[keyof IModels]['Req']]
    >([url, params], queryFn, options);
  }

  return useRapperInfiniteQuery;
}
