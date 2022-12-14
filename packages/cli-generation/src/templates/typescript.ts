/*
 * @Author: xia xian
 * @Date: 2022-07-21 13:52:00
 * @LastEditors: xia xian
 * @LastEditTime: 2022-09-01 15:15:09
 * @Description: generate TS format definition file
 */
import { compile, DEFAULT_OPTIONS, Options } from 'json-schema-to-typescript'
import { chain, compact, map, upperFirst } from 'lodash'
import { TSchema } from '../creator'
import { Intf, POS_TYPE } from '../types/common'
import { creatInterfaceHelpStr, processPlaceholder } from '../utils/convert'

type HandleTSCodeStringParams = {
  Header: string,
  Query: string,
  Body: string,
  Res: string,
}
type HandleTSCOdeStringResult = HandleTSCodeStringParams & {
  enumCodes: string[]
}

function handleTSCodeString(params: HandleTSCodeStringParams, modelName: string): HandleTSCOdeStringResult {
  const result = {} as HandleTSCOdeStringResult
  const enumCodes: string[] = []
  const enumNamePre = modelName.split('/')
    .map(part => upperFirst(part))
    .join('')

  Object.entries(params).forEach(([key, codeStr]) => {
    const codeStrArr = codeStr.split('\nexport')

    let itfCode = codeStrArr[0]
    let itfEnumCodeList = null
    if (codeStrArr.length > 1) {
      itfEnumCodeList = codeStrArr.slice(1).map((enumCodeStr) => {
        const fullEnumCodeStr = `export${enumCodeStr}`
        // 获取旧的enum名
        const enumName = fullEnumCodeStr.match(/export (const ){0,1}enum ([a-zA-Z0-9]+)/)?.[2]
        if (!enumName) {
          return fullEnumCodeStr
        }

        // 替换旧的enum名
        const newEnumName = `${enumNamePre}${upperFirst(key)}${enumName}`
        itfCode = itfCode.replace(enumName, newEnumName)

        return fullEnumCodeStr.replace(enumName, newEnumName)
      })
    }

    result[key as keyof HandleTSCodeStringParams] = itfCode
    if (itfEnumCodeList?.length) {
      enumCodes.push(...itfEnumCodeList)
    }
  })

  return {
    ...result,
    enumCodes,
  } as HandleTSCOdeStringResult
}

/**
 *
 * @param schema
 * @param rapUrl
 * @param codeStyle
 * @returns
 */
export async function getTsModelTemplate(schema: TSchema, rapUrl?: string, codeStyle?: Options) {
  const styleOptions = codeStyle ?? DEFAULT_OPTIONS
  const enumStrList: string[] = []
  const itfStrs = await Promise.all(
    Object.keys(schema).map(async (modelName) => {
      const model = schema[modelName]
      const { name, repositoryId, moduleId, id, header, query, body, res, versionId } = model
      const options: Options = {
        ...styleOptions,
        bannerComment: '',
      }
      const [headerItf, queryItf, bodyItf, resItf] = await Promise.all([
        compile(header, 'Header', options),
        compile(query, 'Query', options),
        compile(body, 'Body', options),
        compile(res, 'Res', options),
      ])

      const {
        Header: headerCode,
        Query: queryCode,
        Body: bodyCode,
        Res: resCode,
        enumCodes,
      } = handleTSCodeString({ Header: headerItf, Query: queryItf, Body: bodyItf, Res: resItf }, modelName)

      if (enumCodes?.length) {
        enumStrList.push(...enumCodes)
      }

      return `
              ${creatInterfaceHelpStr(rapUrl || '', { name, repositoryId, moduleId, id, versionId })}
              '${modelName}': {
                Req: IModels['${modelName}']['Header'] & IModels['${modelName}']['Query'] & IModels['${modelName}']['Body']
                Header: ${headerCode.replace(/export (type|interface) Header =?/, '').replace(/;/g, '')};
                Query: ${queryCode.replace(/export (type|interface) Query =?/, '').replace(/;/g, '')};
                Body: ${bodyCode.replace(/export (type|interface) Body =?/, '').replace(/;/g, '')};
                Res: ${resCode.replace(/export (type|interface) Res =?/, '').replace(/;/g, '')};
              }
            `
    }),
  )
  return `
          export interface IModels {
              ${itfStrs.join('\n\n')}
          };

          ${enumStrList.join('\n\n')}
      `
}
/**
 *
 * @param interfaces
 * @param rapUrl
 * @param versionId
 * @returns
 */
export function getPosTemplate(interfaces: Intf[], rapUrl?: string, versionId?: number) {
  const posStrs = interfaces.map((itf) => {
      const { modelName, properties, name, repositoryId, moduleId, id, url } = itf
      const reqGroup = chain(properties).filter({ scope: 'request', parentId: -1 }).groupBy('pos').value()
      const queryList = reqGroup[POS_TYPE.QUERY] || []
      const headerList = reqGroup[POS_TYPE.HEADER] || []
      const bodyList = reqGroup[POS_TYPE.BODY] || []
      if (!queryList.length && !headerList.length && !bodyList.length) return ''
      const query = chain(processPlaceholder(queryList, url)).unionBy('name').map('name').value()
      const header = map(headerList, 'name')
      const body = map(bodyList, 'name')
      return `
              ${creatInterfaceHelpStr(rapUrl || '', { name, repositoryId, moduleId, id, versionId })}
              '${modelName}': {
                ${header.length > 0 ? `Header: ${JSON.stringify(header)},` : ''}
                ${query.length > 0 ? `Query: ${JSON.stringify(query)},` : ''}
                ${body.length > 0 ? `Body: ${JSON.stringify(body)}` : ''}
              }
            `
    })
  return `
          export const POS_MAP = {
              ${compact(posStrs)}
          };
      `
}
