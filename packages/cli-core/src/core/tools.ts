const chalk = require('chalk')
import axios from 'axios'
import { chain, flatten, unionBy } from 'lodash'
import { ICollaborator, IModules, Interface, Intf, IUrlMapper } from '../types/common'

function updateURLParameter(url: string, param: string, paramVal: string) {
  let newAdditionalURL = ''
  let tempArray = url.split('?')
  const baseURL = tempArray[0]
  const additionalURL = tempArray[1]
  let temp = ''
  if (additionalURL) {
    tempArray = additionalURL.split('&')
    for (let i = 0; i < tempArray.length; i++) {
      if (tempArray[i].split('=')[0] != param) {
        newAdditionalURL += temp + tempArray[i]
        temp = '&'
      }
    }
  }

  const rowsTxt = temp + '' + param + '=' + paramVal
  return baseURL + '?' + newAdditionalURL + rowsTxt
}

/** Query all interface data from rap */
export async function getInterfaces(rapApiUrl: string) {
  console.log(`rapper: start to fetch data from ${rapApiUrl}`)
  const response = await axios.get(rapApiUrl, { timeout: 1000 * 20 })
  const data = response.data.data || {}
  const modules: Array<IModules> = data.modules || []
  const collaborators: Array<ICollaborator> = data.collaborators || []
  let interfaces = chain(modules)
    .map(m => m.interfaces)
    .flatten()
    .value()

  if (collaborators.length) {
    const collaboratorsInterfaces = await Promise.all(
      collaborators.map(e =>
        getInterfaces(
          updateURLParameter(
            updateURLParameter(rapApiUrl, 'id', e.id.toString()),
            'token',
            e.token || '',
          ),
        ),
      ),
    )
    // The collaborative warehouse has duplicate interfaces, which will be covered by the main warehouse
    interfaces = unionBy(
      interfaces,
      flatten(collaboratorsInterfaces.map(v => v.interfaces)),
      item => {
        // If there is a unique identification definition in the description, it will be used first
        const matches = item.description.match(/\${union:\s?(.*)}/)
        if (matches) {
          const [__, unionID] = matches
          return unionID
        }
        // Use method-url as the key
        return `${item.method}-${item.url}`
      },
    )
  }

  // Remove spaces in the field
  interfaces = interfaces.map(item => ({ ...item, name: item.name.trim() }))

  return {
    basePath: data.basePath,
    interfaces,
  }
}
/**
 * Convert rap interface name
 */
export function rap2name(rapUrl: string, itf: Interface.IRoot, urlMapper: IUrlMapper = t => t) {
  const { method, url, repositoryId, id, moduleId } = itf
  const apiUrl = urlMapper(url)

  const regExp = /^(?:https?:\/\/[^\/]+)?(\/?.+?\/?)(?:\.[^./]+)?$/
  const regExpExec = regExp.exec(apiUrl)

  if (!regExpExec) {
    console.log(
      chalk.red(
        `✘ Your rap interface url setting format is incorrect, interface url: ${rapUrl}/repository/editor?id=${repositoryId}&mod=${moduleId}&itf=${id}`,
      ),
    )
    return
  }

  const urlSplit = apiUrl.trim().split('/')

  //Only remove the first empty value, and the last one is empty to keep
  //It may be that the interfaces /api/login and /api/login/ need to exist at the same time
  if (urlSplit[0].trim() === '') {
    urlSplit.shift()
  }

  urlSplit.unshift(method.toLocaleUpperCase())
  return urlSplit.join('/')
}

/** Add modelName to the interface */
export function getIntfWithModelName(
  rapUrl: string,
  intfs: Array<Interface.IRoot>,
  urlMapper: IUrlMapper = t => t,
): Array<Intf & { modelName: string }> {
  return intfs.map(itf => ({
    ...itf,
    modelName: rap2name(rapUrl, itf, urlMapper) || '',
  }))
}

/** Interface deduplication */
export function uniqueItfs(itfs: Array<Intf>) {
  const itfMap = new Map<string, Array<Intf>>()
  itfs.forEach(itf => {
    const name = itf.modelName
    if (itfMap.has(name)) {
      itfMap.get(name)?.push(itf)
    } else {
      itfMap.set(name, [itf])
    }
  })
  const newItfs: Array<Intf> = []
  const duplicateItfs: string[] = []
  itfMap.forEach(dupItfs => {
    // After the change is in front
    dupItfs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    newItfs.push(dupItfs[0])
    if (dupItfs.length > 1) {
      duplicateItfs.push(dupItfs[0].modelName)
    }
  })
  if (duplicateItfs.length) {
    console.log(
      chalk.yellow(
        '    Duplicate interfaces are found, and the latest modification time is adopted：',
      ),
    )
    duplicateItfs.forEach(item => console.log(chalk.yellow(`        ${item}`)))
  }
  return newItfs
}
