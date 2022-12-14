const chalk = require('chalk')
const ora = require('ora')
const packageJson = require('../package.json')

import { JSONSchema4 } from 'json-schema'
import { DEFAULT_OPTIONS } from 'json-schema-to-typescript'
import { format } from 'json-schema-to-typescript/dist/src/formatter'
import _ from 'lodash'
import { Ora } from 'ora'
import {
  ICreatorOptions,
  Interface,
  Intf,
  IOutputFiles,
  POS_TYPE,
  TRAILING_COMMA
} from './types/common'
import { getMd5, writeFile } from './utils'
import { creatHeadHelpStr, interfaceToJSONSchema, processPlaceholder } from './utils/convert'
export type TSchema = Record<
  string,
  Omit<Interface.IRoot, 'properties' | 'locker'> & {
    header: JSONSchema4
    query: JSONSchema4
    body: JSONSchema4
    res: JSONSchema4
    versionId?: number
  }
>
export class BaseCreator {
  private spinner: Ora = ora(chalk.grey('rapper: start to generate'))
  interfaces: Intf[]
  config: ICreatorOptions

  constructor(interfaces: Intf[], config: ICreatorOptions) {
    const codeStyle = {
      singleQuote: true,
      semi: false,
      trailingComma: TRAILING_COMMA.ES5,
      ...config.codeStyle,
    }
    DEFAULT_OPTIONS.style = { ...codeStyle }
    this.config = {
      codeStyle: DEFAULT_OPTIONS,
      ...config,
    }
    this.interfaces = interfaces
  }
  getConfig() {
    return this.config
  }
  parse(): TSchema {
    const { rapUrl, versionId, enumType } = this.config
    return this.interfaces.reduce((schema, itf) => {
      const { url, modelName, repositoryId, moduleId, id } = itf
      const { properties } = this.prepare(itf)
      const resList = _.filter(properties, { scope: 'response' })
      const reqGroup = _.chain(properties).filter({ scope: 'request' }).groupBy('pos').value()
      const queryList = _.unionBy(processPlaceholder(reqGroup[POS_TYPE.QUERY], url), 'name')
      const headerList = reqGroup[POS_TYPE.HEADER]
      const bodyList = reqGroup[POS_TYPE.BODY]
      const typeConfig = { enumType }
      try {
        schema[modelName] = {
          ..._.omit(itf, ['properties', 'locker']),
          header: interfaceToJSONSchema(headerList, 'request', typeConfig),
          query: interfaceToJSONSchema(queryList, 'request', typeConfig),
          body: interfaceToJSONSchema(bodyList, 'request', typeConfig),
          res: interfaceToJSONSchema(resList, 'response', typeConfig),
          versionId
        }
      } catch (error) {
        throw chalk.red(`interface：${rapUrl}/repository/editor?id=${repositoryId}${versionId ? `&versionId=${versionId}` : ''}&mod=${moduleId}&itf=${id}
          generate error
          ${error}`)
      }
      return schema
    }, {} as Record<string, any>)
  }
  prepare(itf: Intf) {
    const { prepareInterface } = this.config
    if (typeof prepareInterface === 'function') return prepareInterface(itf)
    return {
      ...itf,
      properties: [
        ...itf.properties,
        {
          parentId: -1,
          pos: POS_TYPE.QUERY,
          name: '__scene',
          id: 10000,
          type: 'String',
          scope: 'request',
          required: false,
          description: 'scene key',
          value: '',
          creatorId: itf.creatorId,
          repositoryId: itf.repositoryId,
          createdAt: itf.createdAt,
          updatedAt: itf.updatedAt,
          interfaceId: itf.id,
          priority: itf.priority,
          moduleId: itf.moduleId,
        }
      ]
    }
  }

  format(content: string) {
    const { codeStyle, rapUrl, projectId, formatTemplate, versionId } = this.config
    if (typeof formatTemplate === 'function') return formatTemplate(content)
    const headerStr = creatHeadHelpStr(rapUrl, projectId, packageJson.version, versionId)
    const outputStr = headerStr + content
    const formatContent = format(outputStr, codeStyle ?? DEFAULT_OPTIONS)
    return `/* md5: ${getMd5(formatContent)} */\n${formatContent}`
  }

  async write(outputFiles: IOutputFiles[]) {
    return Promise.all(
      outputFiles.map(async ({ filePath, template }) => {
        const content = typeof template === 'function' ? await template() : template
        return writeFile(filePath, this.format(content))
      }),
    )
      .then(() => {
        this.spinner.succeed(
          chalk.green(`rapper: success！synced ${this.interfaces.length} interfaces`),
        )
      })
      .catch((err) => {
        this.spinner.fail(chalk.red(`rapper: fail！${err.message}`))
      })
  }
}
