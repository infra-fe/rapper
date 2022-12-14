import { JSONSchema4 } from 'json-schema'
import * as JSON5 from 'json5'
import { chain } from 'lodash'
import { DefaultTypeConfig } from '../constant'
import { Interface, TypeConfig } from '../types/common'

function inferArraySchema(
  p: Interface.IProperty,
  childProperties: JSONSchema4,
  common: Record<string, any>,
) {
  const rule = (p.rule && p.rule.trim()) || ''
  if (Object.keys(childProperties).length !== 0) {
    // It must be object if it has children
    return [
      p.name,
      {
        type: 'array',
        items: {
          type: 'object',
          properties: childProperties,
          // move child's required to items
          required: common.required,
          additionalProperties: false,
        },
        ...common,
        required: [],
      },
    ]
  } else if (['+1', '1'].includes(rule) && p.value) {
    // If rule is +1, mockjs will sequentially choose 1 element from `array` as the final value。
    // If rule is 1, mockjs will randomly choose 1 element from `array` as the final value。
    // At this time, the type of this attribute is not array, but the type of the sub-elements of array
    // The type of the child element can be inferred from the value
    try {
      const arr: any[] | any = JSON5.parse(p.value)
      if (Array.isArray(arr) && arr.length) {
        const type = chain(arr)
          .map((e) => typeof e)
          .uniq()
          .value()
        return [
          p.name,
          {
            type,
            ...common,
          },
        ]
      } else {
        // resolve failed，return any
        return [
          p.name,
          {
            type: ['string', 'number', 'boolean', 'object'],
            ...common,
          },
        ]
      }
    } catch (error) {
      // resolve failed，return any
      return [
        p.name,
        {
          type: ['string', 'number', 'boolean', 'object'],
          ...common,
        },
      ]
    }
  } else if (p.value) {
    // When there are no descendants, value, and no generation rules, the default hack meets the problem that rap2 cannot express the problem of array<primitive>.
    // The specific type of primitive is inferred by value
    try {
      const v: any[] | any = JSON5.parse(p.value)

      if (Array.isArray(v)) {
        // If it is an empty array, return any[]
        if (!v.length) {
          return [
            p.name,
            {
              type: 'array',
              ...common,
            },
          ]
        }
        // If it is an array, use the array element type
        const type = chain(v)
          .map((e) => typeof e)
          .uniq()
          .value()
        return [
          p.name,
          {
            type: 'array',
            items: {
              type,
            },
            ...common,
          },
        ]
      } else {
        // If it is not an array, use the value type directly
        const type = typeof v
        return [
          p.name,
          {
            type: 'array',
            items: {
              type,
            },
            ...common,
          },
        ]
      }
    } catch (error) {
      // resolve failed, return any[]
      return [
        p.name,
        {
          type: 'array',
          ...common,
        },
      ]
    }
  } else {
    // no generate rules and no values，generate any[]
    return [
      p.name,
      {
        type: 'array',
        ...common,
      },
    ]
  }
}

type Scope = 'request' | 'response'

export const removeComment = (str: string) => str.replace(/\/\*|\*\//g, '')

export function getRestfulPlaceHolders(url: string) {
  const urlSplit = url.split('/')
  const restfulPlaceHolders: string[] = []
  for (let i = 0; i < urlSplit.length; ++i) {
    const part = urlSplit[i]
    const matchKeys = part.match(/(?:\{(.+)\}|\:(.+))/)
    if (!matchKeys) continue
    const key = matchKeys[1] || matchKeys[2]
    restfulPlaceHolders.push(key)
  }
  return restfulPlaceHolders
}

export function getEnumValues(value: string) {
  const regResult = /^@pick\(([\s\S]+)\)$/.exec(value)
  if (!regResult?.[1]) {
    return null
  }

  try {
    return eval(regResult[1])
  } catch {
    return null
  }
}

export function interfaceToJSONSchema(
  input: Interface.IProperty[] = [],
  scope: Scope,
  typeConfig?: TypeConfig
): JSONSchema4 {
  let properties = [
    ...input,
    {
      name: 'dummyroot',
      parentId: -2,
      id: -1,
      scope,
      type: 'object',
    } as any,
  ]
  const tsTypeConfig = {
    ...DefaultTypeConfig,
    ...(typeConfig || {}),
  }

  function findChildProperties(parentId: number): any {
    return chain(properties)
      .filter((p) => p.parentId === parentId)
      .map((p) => {
        const type = p.type.toLowerCase().replace(/regexp|function/, 'string')
        const childProperties = findChildProperties(p.id)
        const childItfs = properties.filter((x) => x.parentId === p.id)
        const common: {
          description?: string
          required: string[]
          additionalProperties: boolean
          enum?: string[]
          tsEnumNames?: string[]
        } = {
          // By default, all attributes have values
          additionalProperties: false,
          required: childItfs.filter((e) => e.required).map((e) => e.name),
        }
        if (p.description) common.description = removeComment(p.description)

        /**
         * Processing enumeration, supports the following forms: (currently controls the scope of influence, only string and number are processed)
         * value="@pick(['p1', 'p2'])"
         * issue link：https://github.com/thx/rapper/issues/9
         */
        if (['string', 'number'].includes(type) && p.value) {
          const enumArr: string[] = getEnumValues(p.value)
          if (Array.isArray(enumArr) && enumArr.length) {
            common.enum = enumArr
            if (tsTypeConfig.enumType === 'enum') {
              common.tsEnumNames = enumArr.map(item => typeof item === 'string' ? item.toUpperCase() : `'${item}'`)
            }
          }
        }

        if (['string', 'number', 'integer', 'boolean', 'null'].includes(type)) {
          return [
            p.name,
            {
              type,
              ...common,
            },
          ]
        } else if (type === 'object') {
          return [
            p.name,
            {
              type,
              properties: childProperties,
              ...common,
            },
          ]
        } else if (type === 'array') {
          return inferArraySchema(p, childProperties, common)
        } else {
          // resolve failed，return any
          return [
            p.name,
            {
              type: ['string', 'number', 'boolean', 'object'],
              ...common,
            },
          ]
          // throw `type: ${type}
          // parentID: ${parentId}
          // itf.url: ${itf.url}
          // ${JSON.stringify(childProperties)}`;
        }
      })
      .fromPairs()
      .value()
  }

  const propertyChildren = findChildProperties(-2)
  const root = propertyChildren['dummyroot']

  // When there is only one array whose key is _root_ or __root__, it means that you want to express that the root node is an array
  if (
    Object.keys(root.properties).length === 1 &&
    (root.properties._root_ || root.properties.__root__)
  ) {
    const _root_ = root.properties._root_ || root.properties.__root__
    if (_root_.type === 'array') {
      return _root_
    }
  }

  return root
}

export function processPlaceholder(properties: Interface.IProperty[], url: string) {
  const placeHolders = getRestfulPlaceHolders(url)
  return [
    ...properties,
    ...placeHolders.map((name, index) => ({
      name,
      parentId: -1,
      id: index + 100,
      scope: 'request',
      type: 'string',
    })),
  ] as Interface.IProperty[]
}

/** Generate prompt copy */
export function creatHeadHelpStr(
  rapUrl?: string,
  projectId?: string | number,
  rapperVersion?: string,
  versionId?: number
): string {
  return `
  /* Rap repository id: ${projectId} */
  /* @infra/generation version: ${rapperVersion} */
  /* eslint-disable */
  /* tslint:disable */
  // @ts-nocheck

  /**
   * This file is automatically generated by Rapper to synchronize the Rap platform interface, please do not modify
   * Rap repository url: ${rapUrl}/repository/editor?id=${projectId}${versionId ? `&versionId=${versionId}` : ''}
   */
  `
}

/**
 * Generate interface prompt copy
 * @param rapUrl Rap url
 * @param itf Interface information
 * @param extra extra information
 */
export function creatInterfaceHelpStr(
  rapUrl: string,
  itf: Partial<Interface.IRoot>,
  extra?: string,
): string {
  const { name, repositoryId, moduleId, id, versionId } = itf

  return `
    /**
     * Interface name：${name}
     * Rap url: ${rapUrl}/repository/editor?id=${repositoryId}${versionId ? `&versionId=${versionId}` : ''}&mod=${moduleId}&itf=${id}
     ${extra || '*'}
     */`
}
