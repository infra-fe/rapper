/*
 * @Author: xia xian
 * @Date: 2022-07-21 13:52:00
 * @LastEditors: xia xian
 * @LastEditTime: 2022-08-29 15:11:18
 * @Description: generate TS format definition file
 */
import JSON5 from 'json5'
import _ from 'lodash'
import { DefaultTypeConfig } from '../constant'
import { Interface, POS_TYPE, TypeConfig } from '../types/common'
import { creatInterfaceHelpStr, getEnumValues, getRestfulPlaceHolders, removeComment } from '../utils/convert'
export const ITEM_EMPTY = 'ItemEmpty'
export const ROOT_ID = -1
const POS_QUERY = POS_TYPE.QUERY


function compareProperties(item: Interface.IProperty[], oldItem: Interface.IProperty[], group: _.Dictionary<Interface.IProperty[]>) {
  const len = item.length
  if (len !== oldItem.length) return false
  let i = 0
  for (; i < len; i++) {
    const a = item[i]
    const b = oldItem[i]
    const type = a.type.toLowerCase()
    if (a.name !== b.name || a.type !== b.type) return false
    if (['array', 'object'].includes(type)) {
      const aChildren = group[a.id]
      const bChildren = group[b.id]
      if (aChildren && !bChildren) return false
      if (!aChildren && bChildren) return false
      if (type === 'array' && !aChildren && !bChildren && getArrayType(a.value) !== getArrayType(b.value)) {
        return false
      }
      if (aChildren && bChildren && !compareProperties(aChildren, bChildren, group)) return false
    }
  }
  if (i !== len) return false
  return true
}
function isNumber(s: unknown) {
  return !Number.isNaN(_.toNumber(s))
}
function traverseItem(itemGroup: _.Dictionary<Interface.IProperty[]>) {
  const items = new Map()
  for (const parentId in itemGroup) {
    const item = itemGroup[parentId]
    item.sort((a, b) => a.name.localeCompare(b.name))
    let name = `Item${parentId}`
    items.forEach((v, k) => {
      const oldItem = itemGroup[k]
      if (compareProperties(item, oldItem, itemGroup)) name = v
    })
    items.set(parentId, name)
  }
  return items
}
function traverseQuery(url: string) {
  const params = url.indexOf('?') > -1 ? new URLSearchParams(url.substring(url.indexOf('?') + 1)) : []
  const query = new Map()
  const queryList: Interface.IProperty[] = []
  const restParams = getRestfulPlaceHolders(url)
  function addQuery(value: unknown, name: unknown) {
    if (!query.has(name)) {
      query.set(name, isNumber(value) ? 'number' : 'string')
    } else {
      query.set(name, isNumber(value) ? 'number[]' : 'string[]')
    }
  }
  restParams.forEach(name => addQuery('_', name))
  params.forEach((value, name) => {
    addQuery(value, name)
  })
  query.forEach((value, key) => {
    queryList.push({
      name: key,
      type: value,
      required: true,
      parentId: ROOT_ID,
      pos: POS_QUERY
    } as Interface.IProperty)
  })
  return queryList
}
function getArrayType(value: string) {
  let TypeName = 'any'
  try {
    const arr = JSON5.parse(value)
    if (Array.isArray(arr) && arr.length > 0) {
      TypeName = typeof arr[0]
    }
  } catch (e) {
  }
  return TypeName
}

interface IDep {
  validator: Set<string>,
  transform: Set<string>,
  enums: enumDataType[],
  empty: boolean,
}

function createParams(list: Interface.IProperty[], items: Map<string, string>, dep: IDep, parentId?: number, tsTypeConfig?: TypeConfig, prefix?: string) {
  const filtered = parentId ? list.filter(item => item.parentId === parentId) : list
  return filtered.reduce((str, props) => {
    const { required, name, value, id, description, pos, scope } = props
    const { validator, transform, enums } = dep
    const type = props.type.toLowerCase().replace(/regexp|function/, 'string')
    const isArray = type === 'array' || type.endsWith('[]')
    const NestedName = items.get(String(id)) || ITEM_EMPTY
    let isNested = items.has(String(id))
    let enumName = ''
    let unionType = ''
    let TypeName = type.replace('[]', '')
    if (TypeName === 'array') {
      TypeName = getArrayType(value)
    }
    if (!isNested && type === 'object') {
      isNested = true
      dep.empty = true
    }
    if (isNested) {
      validator.add('ValidateNested')
    }
    if (isArray) {
      validator.add('IsArray')
    }
    if (['string', 'number'].includes(type) && value) {
      const enumValues = getEnumValues(value)
      if (enumValues?.length) {
        if (tsTypeConfig?.enumType === 'enum') {
          TypeName = 'enum'
          enumName = prefix ? `${prefix}${_.upperFirst(name)}` : `Enum${id}`
          // 矫正重名的enumName
          const matchNameList = dep.enums.filter(item => item.name.startsWith(enumName))
          if (matchNameList?.length) {
            const maxIndex = Math.max(...matchNameList.map(item => Number(item.name) || 0)) || 0
            enumName = `${enumName}${maxIndex + 1}`
          }
          enums.push({
            name: enumName,
            values: enumValues,
          })
        } else {
          unionType = enumValues
            .map((value: string | number) => JSON.stringify(value))
            .join(' | ')
        }
      }
    }
    if (required) {
      validator.add('IsNotEmpty')
    } else {
      validator.add('IsOptional')
    }
    if ((type === 'number' || isNested) && transform.size === 0) {
      transform.add('Type');
    }
    // const prefixType = type.replace('[]', '')
    if (['number', 'string', 'boolean', 'enum'].indexOf(TypeName) > -1) {
      validator.add(`Is${_.upperFirst(TypeName)}`)
    }
    str += `
          ${description ? `/**\n    ${removeComment(description)}\n  */` : ''}
          ${required && type !== 'null' ? ' @IsNotEmpty()' : '@IsOptional()'}
          ${isNested ? '@ValidateNested()' : ''}
          ${isNested ? `@Type(() => ${NestedName})` : ''}
          ${TypeName === 'number' && pos === POS_QUERY && scope !== 'response' ? `@Type(() => Number)` : ''}
          ${TypeName === 'number' ? `@IsNumber(${isArray ? '{}, {each: true}' : ''})` : ''}
          ${TypeName === 'string' ? `@IsString(${isArray ? '{each: true}' : ''})` : ''}
          ${TypeName === 'boolean' ? `@IsBoolean(${isArray ? '{each: true}' : ''})` : ''}
          ${TypeName === 'enum' ? `@IsEnum(${enumName})` : ''}
          ${isArray ? '@IsArray()' : ''}
          '${name}' : ${isNested ? NestedName : enumName || unionType || TypeName}${isArray ? '[]' : ''}

      `
    return str
  }, '')
}

type enumDataType = {
  name: string
  values: string[] | number[]
}

export function getDtoTemplate(itf: Interface.IRoot, rapUrl?: string, typeConfig?: TypeConfig) {
  const { url, method, name, repositoryId, moduleId, id, properties, versionId } = itf
  let path = url.indexOf('/') > -1 ? url.substring(url.indexOf('/') + 1) : url
  const request = properties.filter(p => p.scope === 'request')
  const response = properties.filter(p => p.scope === 'response')
  const itemsGroup = _.chain(properties).filter(item => item.parentId !== ROOT_ID).groupBy(item => item.parentId).value()
  const items = traverseItem(itemsGroup)
  const query = traverseQuery(url).filter(p => !request.find(req => req.name === p.name))
  if (path.indexOf('?') > -1) {
    path = path.substring(0, path.indexOf('?'))
  }
  const dtoName = _.upperFirst(method.toLowerCase()) + path.split('/').map(s => {
    return (/^(\:|\{).+/.test(s) ? '1' : '') + _.chain(s).camelCase().upperFirst().value()
  }).join('')
  const dep = {
    validator: new Set<string>(),
    transform: new Set<string>(),
    enums: [] as enumDataType[],
    empty: false
  }

  const tsTypeConfig = {
    ...DefaultTypeConfig,
    ...(typeConfig || {}),
  }

  const contentStr = `
    export class ${dtoName}ReqDto {
      ${createParams(query, items, dep, ROOT_ID, tsTypeConfig, `${dtoName}Req`)}
      ${createParams(request, items, dep, ROOT_ID, tsTypeConfig, `${dtoName}Req`)}
    }
    export class ${dtoName}ResDto {
      ${createParams(response, items, dep, ROOT_ID, tsTypeConfig, `${dtoName}Res`)}
    }
  `
  const itemArr = Array.from(items)
  const itemStr = itemArr.sort((a, b) => b[0] - a[0]).reduce((str, cur) => {
    const [k, v] = cur
    if (String(k) === v.replace('Item', '')) {
      str += `
      export class Item${k} {
        ${createParams(itemsGroup[k], items, dep, undefined, tsTypeConfig, `${dtoName}Item`)}
      }

      `
    }
    return str
  }, '')
  const enumStrList = dep.enums.map(({ name, values }) => {
    return `
    export const enum ${name} {
      ${values
        .map((value) => `${typeof value === 'string' ? value.toUpperCase() : `'${value}'`} = ${JSON.stringify(value)}`)
        .join(',\n')}
    }
    `
  })
  const { validator, transform, empty } = dep
  return {
    str: `
    ${creatInterfaceHelpStr(rapUrl || '', { name, repositoryId, moduleId, id, versionId })}
    ${validator.size > 0 ? `import { ${Array.from(validator).join(',')} } from 'class-validator'` : ''}
    ${transform.size > 0 ? `import { ${Array.from(transform).join(',')} } from 'class-transformer'` : ''}
    ${empty ? `import { ItemEmpty } from '.'` : ''}
    ${enumStrList.join('\n\n')}
    ${itemStr}
    ${contentStr}
  `,
    req: `${dtoName}ReqDto`,
    res: `${dtoName}ResDto`,
    empty
  }
}
