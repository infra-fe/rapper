import { IRapperConfig } from '../types/index'
import { getConfigFromCommander } from './fromCommander'
import { getConfigFromPkgJson } from './fromPkgJson'
import { getConfigFromRapConfig } from './fromRapConfig'
const getApiUrl = (config: IRapperConfig) => {
  const { apiUrl, projectId, token, versionId } = config
  return `${apiUrl.replace(/\/$/, '')}/api/repository/get?id=${projectId}&token=${token}${versionId ? `&versionId=${versionId}` : ''}`
}
export function readConfig(program: Record<string, any>) {
  const rapConfig: IRapperConfig | IRapperConfig[] =
    getConfigFromRapConfig() || getConfigFromPkgJson() || getConfigFromCommander(program)
  if (!rapConfig) {
    console.error('invalid rap config')
    return process.exit(1)
  }
  let list: IRapperConfig[] = []
  if (Array.isArray(rapConfig)) {
    list = rapConfig.map((config) => {
      return {
        ...config,
        apiUrl: getApiUrl(config),
      }
    })
  } else {
    list = [
      {
        ...rapConfig,
        apiUrl: getApiUrl(rapConfig),
      },
    ]
  }
  const rapperPaths = [...new Set(list.map((v) => v.rapperPath))]
  if (rapperPaths.length < list.length) {
    console.error('There are duplicates of rapperPath')
    process.exit(1)
  }
  return list
}
