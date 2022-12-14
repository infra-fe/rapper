export function processRestfulUrl(url: string, params: Record<string, any>) {
  // only handle object
  if (Object.prototype.toString.call(params) === '[object Object]') {
    const urlSplit = url.split('/')
    const newParams = { ...params }
    for (let i = 0; i < urlSplit.length; ++i) {
      const part = urlSplit[i]
      // Compatible with oneApi and egg params passing parameters Example: :appId / {appId}
      const matchKeys = part.match(/(?:\{(.*)\}|\:(.*))/)
      if (!matchKeys) continue
      const key = matchKeys[1] || matchKeys[2]
      if (!params.hasOwnProperty(key)) {
        console.warn('Please set value for template key: ', key)
        continue
      }
      urlSplit[i] = matchKeys.input?.replace(matchKeys[0], params[key]) || ''
      delete newParams[key]
    }

    return { url: urlSplit.join('/'), params: newParams }
  }
  return { url, params }
}

export function isObject(target: unknown) {
  return Object.prototype.toString.call(target) === '[object Object]'
}
