import useSWRV, { IConfig } from 'swrv'

export function createSwrv<
  IModels extends Record<
    keyof IModels,
    {
      Req: Record<string, unknown>
      Res: Record<string, unknown>
    }
  >,
>(fetcher: (...args: any[]) => Promise<any>) {
  return function useSwrHook<T extends Exclude<keyof IModels, number | symbol>>(
    url: T,
    payload?: IModels[T]['Req'],
    config?: IConfig,
  ) {
    return useSWRV<IModels[T]['Res']>(
      url,
      (...args: [T, ...unknown[]]) => fetcher(args[0], args[1] ?? payload),
      config,
    )
  }
}
