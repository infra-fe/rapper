export namespace Interface {
  export interface IProperty {
    id: number
    scope: string
    type: string
    pos: number
    name: string
    rule?: string
    value: string
    description: string
    parentId: number
    priority: number
    interfaceId: number
    creatorId: number
    moduleId: number
    repositoryId: number
    required: boolean
    createdAt: Date
    updatedAt: Date
    deletedAt?: any
  }

  export interface IRoot {
    id: number
    name: string
    url: string
    method: string
    description: string
    priority: number
    status: number
    creatorId: number
    lockerId?: any
    moduleId: number
    repositoryId: number
    createdAt: Date
    updatedAt: Date
    deletedAt?: any
    locker?: any
    properties: Array<IProperty>
    versionId?: number
  }
}

export type Intf = Interface.IRoot & { modelName: string }

export interface IModules {
  id: number
  name: string
  description: string
  priority: number
  creatorId: number
  repositoryId: number
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  interfaces: Array<Intf>
}

export interface ICollaborator {
  id: number
  name: string
  token: string
  description: string
  logo?: any
  visibility: boolean
  ownerId: number
  organizationId?: any
  creatorId: number
  lockerId?: any
  createdAt: Date
  updatedAt: Date
  deletedAt?: any
}

/** url matching function */
export interface IUrlMapper {
  (url: string): string
}

/** Generate template type */
export type RAPPER_TYPE = 'ts' | 'http' | 'normal' | 'redux' | 'react' | 'dto'

/** End comma */
export enum TRAILING_COMMA {
  NONE = 'none',
  ALL = 'all',
  ES5 = 'es5',
}

/** Generated code */
export interface IGeneratedCode {
  /** Top import */
  import: string
  body: string
  export: string
}

/** Parameters of the create function */
export interface ICreatorExtr {
  rapUrl: string
  resSelector: string
}
