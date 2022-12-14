import { useRequest } from 'ahooks'
import type { Options, Result } from 'ahooks/lib/useRequest/src/types'
import type { AxiosRequestConfig } from 'axios'

export function createUseHttp<
  IModels extends Record<
    keyof IModels,
    {
      Req: Record<string, unknown>
      Res: Record<string, unknown>
    }
  >,
  U extends keyof IModels = keyof IModels,
>(fetchFn: (...args: any[]) => Promise<IModels[U]['Res']>) {
  return function useHttp<T extends keyof IModels>(
    url: T,
    payload?: IModels[T]['Req'] | null,
    options?: {
      axiosConfig?: Omit<AxiosRequestConfig, 'url' | 'method'>
    } & Options<IModels[T]['Res'], [IModels[T]['Req']]>,
  ): Result<IModels[T]['Res'], [IModels[T]['Req']]> {
    const { axiosConfig, ...requestOptions } = options || {}

    return useRequest<IModels[T]['Res'], [IModels[T]['Req']]>(async (params) => {
      const res = await fetchFn(url, params || payload, axiosConfig)
      return res
    }, requestOptions)
  }
}
