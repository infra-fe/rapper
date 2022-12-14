// export const useHttp = createUseHttp<IModels>(http)
import { AxiosRequestConfig } from 'axios'
export type IFetch<
  IModels extends Record<
    Exclude<keyof IModels, number | symbol>,
    {
      Req: unknown
      Res: unknown
    }
  >,
> = {
  [K in keyof IModels]: (
    payload?: IModels[K]['Req'],
    config?: Omit<AxiosRequestConfig<IModels[K]['Res']>, 'method'>,
  ) => Promise<IModels[K]['Res']>
}

const fetchMap = {}
export function createFallbackFetch<
  IModels extends Record<
    Exclude<keyof IModels, number | symbol>,
    {
      Req: unknown
      Res: unknown
    }
  >,
>(http: any) {
  return new Proxy(fetchMap, {
    get(target, prop) {
      return (...args: any) => http(prop, ...args)
    },
  }) as IFetch<IModels>
}
