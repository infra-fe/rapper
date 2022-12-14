import type { Axios, AxiosInstance, AxiosRequestConfig } from 'axios'
import merge from 'lodash.merge'
import omit from 'lodash.omit'

import { getAxiosInstance } from './axiosInstance'
import { interceptorParseUrl, interceptorUrlPlaceholder, interceptorBuiltinParams } from './interceptors'
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH' | 'HEAD'

interface IHttpRequestOptions {
  created: (axiosInstance: AxiosInstance) => void
}

type ConfigOptions<D = any> = Omit<AxiosRequestConfig<D>, 'method' | 'url'>
export interface IHttpRequest<
  IModels extends Record<
    Exclude<keyof IModels, number | symbol>,
    {
      Req: unknown
      Res: unknown
    }
  >,
  D = any,
> {
  <T extends keyof IModels>(
    url: T,
    payload?: IModels[T]['Req'],
    config?: ConfigOptions<D>,
  ): Promise<IModels[T]['Res']>
  axiosInstance: Axios
  interceptors: Axios['interceptors']
  get<T extends keyof ModelGet<IModels>>(
    url: T,
    payload?: ModelGet<IModels>[T]['Req'],
    config?: ConfigOptions<D>,
  ): Promise<ModelGet<IModels>[T]['Res']>
  post<T extends keyof ModelPost<IModels>>(
    url: T,
    payload?: ModelPost<IModels>[T]['Req'],
    config?: ConfigOptions<D>,
  ): Promise<ModelPost<IModels>[T]['Res']>
  put<T extends keyof ModelPut<IModels>>(
    url: T,
    payload?: ModelPut<IModels>[T]['Req'],
    config?: ConfigOptions<D>,
  ): Promise<ModelPut<IModels>[T]['Res']>
  patch<T extends keyof ModelPatch<IModels>>(
    url: T,
    payload?: ModelPatch<IModels>[T]['Req'],
    config?: ConfigOptions<D>,
  ): Promise<ModelPatch<IModels>[T]['Res']>
  delete<T extends keyof ModelDelete<IModels>>(
    url: T,
    payload?: ModelDelete<IModels>[T]['Req'],
    config?: ConfigOptions<D>,
  ): Promise<ModelDelete<IModels>[T]['Res']>
}

export type ModelKeys<IModels> = Exclude<keyof IModels, number | symbol>

export type FilterModelKeys<T, Method extends RequestMethod> = T extends `${Method}/${string}`
  ? T
  : never

export type ModelMethod<IModels, Method extends RequestMethod> = Pick<
  IModels,
  FilterModelKeys<ModelKeys<IModels>, Method>
>

export type ModelGet<IModels> = ModelMethod<IModels, 'GET'>
export type ModelPost<IModels> = ModelMethod<IModels, 'POST'>
export type ModelPut<IModels> = ModelMethod<IModels, 'PUT'>
export type ModelPatch<IModels> = ModelMethod<IModels, 'PATCH'>
export type ModelDelete<IModels> = ModelMethod<IModels, 'DELETE'>

export function createHttpRequest<
  IModels extends Record<
    Exclude<keyof IModels, number | symbol>,
    {
      Req: unknown
      Res: unknown
    }
  >,
  D = any,
>(axiosConfig?: AxiosRequestConfig<D>, options?: IHttpRequestOptions): IHttpRequest<IModels, D> {
  const axiosInstance = getAxiosInstance(axiosConfig)
  options?.created(axiosInstance)

  axiosInstance.interceptors.request.use(interceptorParseUrl)
  axiosInstance.interceptors.request.use(interceptorUrlPlaceholder)
  axiosInstance.interceptors.request.use(interceptorBuiltinParams)

  function http<T extends keyof IModels>(
    url: T,
    payload?: IModels[T]['Req'],
    config?: Omit<AxiosRequestConfig<D>, 'method' | 'url'>,
  ) {
    const method = (url as string)?.split('/')?.[0] as RequestMethod
    const IsGet = method === 'GET'
    return axiosInstance
      .request<IModels[T]['Res']>({
        method: method.toLocaleLowerCase(),
        ...merge(IsGet ? { params: payload } : { data: payload }, config),
        url: url as string,
      })
      .then((r) => r?.data)
  }

  http.axiosInstance = axiosInstance
  http.interceptors = axiosInstance.interceptors

  http.get = function get<T extends keyof ModelGet<IModels>>(
    url: T,
    payload?: ModelGet<IModels>[T]['Req'],
    config?: Omit<AxiosRequestConfig<D>, 'method' | 'url'>,
  ) {
    return axiosInstance
      .get<ModelGet<IModels>[T]['Res']>(url, {
        ...omit(config, 'method', 'url'),
        params: payload,
      })
      .then((r) => r?.data)
  }

  http.post = function post<T extends keyof ModelPost<IModels>>(
    url: T,
    payload?: ModelPost<IModels>[T]['Req'],
    config?: Omit<AxiosRequestConfig<D>, 'method' | 'url'>,
  ) {
    return axiosInstance
      .post<ModelPost<IModels>[T]['Res']>(url, payload, omit(config, 'method', 'url'))
      .then((r) => r?.data)
  }

  http.delete = function del<T extends keyof ModelDelete<IModels>>(
    url: T,
    payload?: ModelDelete<IModels>[T]['Req'],
    config?: Omit<AxiosRequestConfig<D>, 'method' | 'url'>,
  ) {
    return axiosInstance
      .delete<ModelDelete<IModels>[T]['Res']>(url, {
        ...omit(config, 'method', 'url'),
        data: payload,
      })
      .then((r) => r?.data)
  }

  http.put = function put<T extends keyof ModelPut<IModels>>(
    url: T,
    payload?: ModelPut<IModels>[T]['Req'],
    config?: Omit<AxiosRequestConfig<D>, 'method' | 'url'>,
  ) {
    return axiosInstance
      .put<ModelPut<IModels>[T]['Res']>(url, payload, omit(config, 'method', 'url'))
      .then((r) => r?.data)
  }

  http.patch = function patch<T extends keyof ModelPatch<IModels>>(
    url: T,
    payload?: ModelPatch<IModels>[T]['Req'],
    config?: Omit<AxiosRequestConfig<D>, 'method' | 'url'>,
  ) {
    return axiosInstance
      .patch<ModelPatch<IModels>[T]['Res']>(url, payload, omit(config, 'method', 'url'))
      .then((r) => r?.data)
  }

  return http
}
