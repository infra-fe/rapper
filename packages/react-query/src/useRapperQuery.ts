/* eslint-disable @typescript-eslint/naming-convention */
import type { IHttpRequest } from '@rapper3/request'
import {
  useQuery,
  UseQueryOptions,
  QueryFunctionContext,
} from '@tanstack/react-query'
import { AxiosConfig } from './types'

export function createUseRapperQuery<
  IModels extends Record<
    Exclude<keyof IModels, number | symbol>,
    {
      Req: unknown
      Res: unknown
    }
  >,
  Data = any,
>(
  http: IHttpRequest<IModels, Data>,
  config?: Omit<AxiosConfig<Data>, 'method' | 'url'>,
) {
  const queryFn = ({
    queryKey,
  }: QueryFunctionContext<[keyof IModels, IModels[keyof IModels]['Req']]>) =>
    http(queryKey[0], queryKey[1], config)

  function useRapperQuery<TKey extends keyof IModels, TError = unknown>(
    url: TKey,
    params?: IModels[TKey]['Req'],
    options?: Omit<
      UseQueryOptions<
        IModels[TKey]['Res'],
        TError,
        IModels[TKey]['Res'],
        [TKey, IModels[TKey]['Req']]
      >,
      'queryKey' | 'queryFn'
    >,
  ) {
    return useQuery<
      IModels[TKey]['Res'],
      TError,
      IModels[TKey]['Res'],
      [TKey, IModels[TKey]['Req']]
    >([url, params], queryFn, options)
  }

  return useRapperQuery
}

export function createRapperQueryOptions<
  IModels extends Record<
    Exclude<keyof IModels, number | symbol>,
    {
      Req: unknown
      Res: unknown
    }
  >,
  Data = any,
>(_http: IHttpRequest<IModels, Data>) {
  function options<TKey extends keyof IModels, TError = unknown>(
    url: TKey,
    params?: IModels[TKey]['Req'],
    options?: Omit<
      UseQueryOptions<
        IModels[TKey]['Res'],
        TError,
        IModels[TKey]['Res'],
        [TKey, IModels[TKey]['Req']]
      >,
      'queryKey' | 'queryFn'
    >,
  ): RapperQueryOptions<IModels, TKey, TError> {
    if (options) {
      return [url, params, options]
    }
    if (params) {
      return [url, params]
    }
    return [url]
  }

  return options
}

export type RapperQueryOptions<
  IModels extends Record<
    Exclude<keyof IModels, number | symbol>,
    {
      Req: unknown
      Res: unknown
    }
  >,
  Key extends keyof IModels,
  Error = unknown,
> =
  | readonly [Key]
  | readonly [Key, IModels[Key]['Req'] | undefined]
  | readonly [
      Key,
      IModels[Key]['Req'] | undefined,
      (
        | Omit<
            UseQueryOptions<
              IModels[Key]['Res'],
              Error,
              IModels[Key]['Res'],
              [Key, IModels[Key]['Req']]
            >,
            'queryKey' | 'queryFn'
          >
        | undefined
      ),
    ]
