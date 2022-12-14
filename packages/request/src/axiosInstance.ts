import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import merge from 'lodash.merge'

const DefaultAxiosConfig: AxiosRequestConfig = {
  timeout: 10 * 1000,
  withCredentials: true,
}
interface IFunc<D = any> {
  (config?: AxiosRequestConfig<D>): AxiosInstance
}

export const getAxiosInstance: IFunc = (config) => {
  const finalConfig = merge({}, DefaultAxiosConfig, config)
  return axios.create(finalConfig)
}
