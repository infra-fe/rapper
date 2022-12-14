import { IRapperConfig, TransformCustom } from './types/index'
import { invokeRun } from './utils/invokeRun'
interface IOptions {
  transform: TransformCustom
}
export function defineConfig(config: IRapperConfig | IRapperConfig[], options?: IOptions) {
  return function run() {
    const rapperConfigs = Array.isArray(config) ? config : [config]
    rapperConfigs.filter((v) => !!v).forEach((item) => invokeRun(item))
  }
}
