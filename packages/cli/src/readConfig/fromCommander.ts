const qs = require('query-string')
export function getConfigFromCommander(program: any) {
  if (program.type && program.apiUrl && program.rapUrl) {
    /** from scripts config */
    const { id, token, versionId } = qs.parse(program.apiUrl.split('?')[1]) || {}
    return {
      type: program.type,
      apiUrl: program.apiUrl.split('/api')[0],
      projectId: id,
      token: token,
      rapUrl: program.rapUrl,
      resSelector: program.resSelector,
      rapperPath: program.rapperPath || './src/rapper',
      versionId,
      enumType: program.enumType,
    }
  }
  return null
}
