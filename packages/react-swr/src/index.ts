import useSWR, { Key, SWRConfiguration, useSWRConfig } from 'swr'

export function createSwr<
  IModels extends Record<
    keyof IModels,
    {
      Req: Record<string, unknown>
      Res: Record<string, unknown>
    }
  >,
>(fetcher: (...args: any[]) => Promise<any>) {
  return function useSwrHook<
    T extends Exclude<keyof IModels, number | symbol>,
    URL extends T | [T, IModels[T]['Req']] | null,
  >(
    url: URL,
    payload?: URL extends T
      ? IModels[URL]['Req']
      : IModels[URL extends [infer U, ...unknown[]] ? U : T]['Req'],
    config?: SWRConfiguration<
      URL extends T
        ? IModels[URL]['Res']
        : IModels[URL extends [infer U, ...unknown[]] ? U : T]['Res']
    >,
  ) {
    // TODO: function key in swr
    // type PickU<K> = K extends (() => infer U extends T) ? U : T
    return useSWR<
      URL extends T
        ? IModels[URL]['Res']
        : URL extends [infer U extends T, ...unknown[]]
        ? IModels[U]['Res']
        : null,
      any,
      Key
    >(url, (...args: [T, ...unknown[]]) => fetcher(args[0], args[1] ?? payload), config as any)
  }
}

export function createUseMutate<IModels extends Record<Exclude<keyof IModels, number | symbol>, any>>() {
  return function useMutate(){
    const { mutate } = useSWRConfig()
    return function rapperMutate<T extends Exclude<keyof IModels, number | symbol>>(url: T) {
      return mutate(url)
    }
  }
}