import type { AxiosRequestConfig } from 'axios'
import pickBy from 'lodash.pickby'
import { isObject, processRestfulUrl } from './utils'

export function interceptorParseUrl(config: AxiosRequestConfig) {
  if (!config) {
    throw new Error('Missing return AxiosRequestConfig, Plz check your interceptor returning')
  }

  const [method, ...rest] = config?.url?.split('/') || []

  if (['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'].includes(method.toUpperCase())) {
    config.url = rest?.join('/') || ''
  }

  if (!config?.baseURL?.endsWith('/') && !config?.url?.startsWith('/')) {
    config.url = `/${config.url}`
  }

  if (config?.baseURL?.endsWith('/') && config?.url?.startsWith('/')) {
    config.url = config.url.substring(1)
  }
  return config
}

// restful url API
export function interceptorUrlPlaceholder(config: AxiosRequestConfig) {
  if (!config) {
    throw new Error('Missing return AxiosRequestConfig, Plz check your interceptor returning')
  }
  const allPayload = { ...config.data, ...config.params }
  const { url, params } = processRestfulUrl(config.url || '', allPayload)
  config.url = url
  const isGet = config?.method?.toUpperCase() === 'GET'
  if (isGet) {
    config.params = params
  } else {
    config.data = params
  }
  return config
}

// 内置参数处理：如__scene、__version
export function interceptorBuiltinParams(config: AxiosRequestConfig) {
  // 如果请求的是rap的mock接口时, 不处理内置参数
  if ((config.baseURL || '').includes('/api/app/mock')) return config

  // 如果请求的非rap的mock接口，则需要内置参数删掉
  if (isObject(config.params)) {
    config.params = pickBy(config.params, (val, key) => !key.startsWith('__'))
  }
  if (isObject(config.data)) {
    config.data = pickBy(config.data, (val, key) => !key.startsWith('__'))
  }
  return config
}

interface IPosMap {
  [key: string]: {
    Header?: string[]
    Query?: string[]
    Body?: string[]
  }
}
export function createSeprateInterceptor(posMap: IPosMap) {
  return (config: AxiosRequestConfig) => {
    const targetPos = posMap[config.url as string]
    if (!targetPos) return config
    const isGet = config.method?.toLowerCase() === 'get'
    const allPayload = { ...config.data, ...config.params }
    const builtinPayload = pickBy(allPayload, (v, key) => key.startsWith('__'))
    const header = pickBy(allPayload, (v, key) => targetPos?.Header?.includes(key))
    const params = pickBy(allPayload, (v, key) => targetPos?.Query?.includes(key))
    const data = pickBy(allPayload, (v, key) => targetPos?.Body?.includes(key))

    const buildInKeys = Object.keys(builtinPayload)
    const headerKeys = Object.keys(header)
    const paramsKeys = Object.keys(params)
    const dataKeys = Object.keys(data)

    const notParamsKeys = [...buildInKeys, ...headerKeys, ...dataKeys]
    const notBodyKeys = [...buildInKeys, ...headerKeys, ...paramsKeys]

    if (headerKeys.length) {
      config.headers = {
        ...config.headers,
        ...header
      }
    }
    if (paramsKeys.length) {
      config.params = params
    }
    if (dataKeys.length) {
      config.data = data
    }
    if (isObject(config.params)) {
      config.params = pickBy(config.params, (val, key) => !notParamsKeys.includes(key))
    }
    if (isObject(config.data)) {
      config.data = pickBy(config.data, (val, key) => !notBodyKeys.includes(key))
    }
    if (isGet) {
      config.params = {
        ...config.params,
        ...builtinPayload
      }
    } else {
      config.data = {
        ...config.data,
        ...builtinPayload
      }
    }

    return config
  }
}