/* eslint-disable @typescript-eslint/naming-convention */
import { IHttpRequest } from '@rapper3/request';
import { useMutation, UseMutationOptions } from 'react-query';
import { AxiosConfig } from './types';

export function createUseRapperMutation<
  IModels extends Record<
    Exclude<keyof IModels, number | symbol>,
    {
      Req: unknown;
      Res: unknown;
    }
  >,
  Data = any,
>(http: IHttpRequest<IModels, Data>, config?: Omit<AxiosConfig<Data>, 'method' | 'url'>) {
  function useRapperMutation<TKey extends keyof IModels, TError = unknown>(
    url: TKey,
    options?: Omit<
      UseMutationOptions<
        IModels[TKey]['Res'],
        TError,
        IModels[TKey]['Req'],
        [TKey, IModels[TKey]['Req']]
      >,
      'mutationKey' | 'mutationFn'
    >,
  ) {
    return useMutation(
      [url],
      (params?: IModels[TKey]['Req']) => http(url, params, config),
      options,
    );
  }

  return useRapperMutation;
}
