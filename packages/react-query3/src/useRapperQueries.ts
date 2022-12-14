/* eslint-disable no-inline-comments */
/* eslint-disable @typescript-eslint/naming-convention */
import { IHttpRequest } from '@rapper3/request';
import {
  useQueries,
  QueryFunctionContext,
  UseQueryOptions,
  UseQueryResult,
  QueryFunction,
} from 'react-query';
import { AxiosConfig } from './types';

export type Query<
  IModels extends Record<
    string | number | symbol,
    {
      Req: unknown;
      Res: unknown;
    }
  >,
> = {
  [K in keyof IModels]: {
    url: K;
    params?: IModels[K]['Req'];
    options?: UseQueryOptions<
      IModels[K]['Res'],
      unknown,
      IModels[K]['Res'],
      [K, IModels[K]['Req']]
    >;
  };
}[keyof IModels];

export type GetResults<T> =
  // Part 1: responsible for mapping explicit type parameter to function result, if object
  T extends { queryFnData: any; error?: infer TError; data: infer TData }
    ? UseQueryResult<TData, TError>
    : T extends { queryFnData: infer TQueryFnData; error?: infer TError }
    ? UseQueryResult<TQueryFnData, TError>
    : T extends { data: infer TData; error?: infer TError }
    ? UseQueryResult<TData, TError>
    : // Part 2: responsible for mapping explicit type parameter to function result, if tuple
    T extends [any, infer TError, infer TData]
    ? UseQueryResult<TData, TError>
    : T extends [infer TQueryFnData, infer TError]
    ? UseQueryResult<TQueryFnData, TError>
    : T extends [infer TQueryFnData]
    ? UseQueryResult<TQueryFnData>
    : // Part 3: responsible for mapping inferred type to results, if no explicit parameter was provided
    T extends {
        queryFn?: QueryFunction<unknown, any>;
        select: (data: any) => infer TData;
      }
    ? UseQueryResult<TData>
    : T extends { queryFn?: QueryFunction<infer TQueryFnData, any> }
    ? UseQueryResult<TQueryFnData>
    : // Fallback
      UseQueryResult;

type MAXIMUM_DEPTH = 5;

export type GetResultsFromOption<
  T,
  Fetch extends Record<
    keyof Fetch,
    {
      Req: unknown;
      Res: unknown;
    }
  >,
> = T extends {
  url: infer URL extends keyof Fetch;
  // eslint-disable-next-line prettier/prettier
  params?: infer Params;
}
  ? GetResults<
      T & {
        queryFn: QueryFunction<Fetch[URL]['Res'], readonly [URL, Params]>;
      }
    >
  : GetResults<T>;

export type NBArray<T> = T[] | readonly T[];

export type QueriesResults<
  T extends NBArray<any>,
  Fetch extends Record<
    keyof Fetch,
    {
      Req: unknown;
      Res: unknown;
    }
  >,
  Result extends any[] = [],
  Depth extends ReadonlyArray<number> = [],
> = Depth['length'] extends MAXIMUM_DEPTH
  ? UseQueryResult[]
  : T extends [] | readonly []
  ? []
  : T extends [infer Head] | readonly [infer Head]
  ? [...Result, GetResultsFromOption<Head, Fetch>]
  : T extends [infer Head, ...infer Tail] | readonly [infer Head, ...infer Tail]
  ? QueriesResults<[...Tail], Fetch, [...Result, GetResultsFromOption<Head, Fetch>], [...Depth, 1]>
  : // eslint-disable-next-line prettier/prettier
  T extends NBArray<{ url: infer URL extends keyof Fetch }>
  ? // Dynamic-size (homogenous) UseQueryOptions array: map directly to array of results
    UseQueryResult<Fetch[URL]['Res'], unknown>[]
  : // Fallback
    UseQueryResult[];

export function createUseRapperQueries<
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
  }: QueryFunctionContext<[keyof IModels, IModels[keyof IModels]['Req']]>) =>
    http(queryKey[0], queryKey[1], config);

  function useRapperQueries<Queries extends readonly Query<IModels>[]>({
    queries,
  }: {
    queries: Queries;
  }) {
    return useQueries(
      queries.map(({ url, params, options }) => ({
        ...options,
        queryFn: queryFn as (
          context: QueryFunctionContext<[typeof url, IModels[typeof url]['Req']]>,
        ) => IModels[typeof url]['Res'],
        queryKey: [url, params],
      })) as any[],
    ) as QueriesResults<Queries, IModels>;
  }

  return useRapperQueries;
}
