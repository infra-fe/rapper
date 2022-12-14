import {
  BaseCreator,
  getPosTemplate,
  getTsModelTemplate,
  Intf,
  IOutputFiles,
} from '@rapper3/cli-generation';
import { IRapperConfig } from '../types/index';

export async function transIntfs2HttpFile(
  {
    intfList,
    basePath,
  }: {
    intfList: Intf[];
    basePath: string;
  },
  rapperConfig?: IRapperConfig,
) {
  const { rapperPath, rapUrl, projectId, versionId, enumType } = rapperConfig || {};
  const tsCreator = new BaseCreator(intfList, {
    rapUrl: rapUrl || '',
    projectId: projectId || -1,
    versionId,
    enumType,
  });
  const { codeStyle } = tsCreator.getConfig();
  const templateList: IOutputFiles[] = [
    {
      filePath: `${rapperPath}/models.ts`,
      template: async () => {
        const schema = await tsCreator.parse();
        const modelStr = getTsModelTemplate(schema, rapUrl, codeStyle);
        return modelStr;
      },
    },
    {
      filePath: `${rapperPath}/pos.ts`,
      template: async () => {
        const posStr = getPosTemplate(intfList, rapUrl, versionId);
        return posStr;
      },
    },
    {
      filePath: `${rapperPath}/http.ts`,
      template: () => {
        const basePathStr = basePath
          ? `
        http.interceptors.request.use(config => {
          const url = [(config.baseURL || '').replace(/\\/$/, ''), '${basePath}'.replace(/^\\//, '')].join('/')
          config.baseURL = url
          return config
        })\n
        `
          : '';
        return `
        import { createHttpRequest, createFallbackFetch, createSeprateInterceptor } from '@rapper3/request'
        import { IModels } from './models'
        import { POS_MAP } from './pos'

        export const http = createHttpRequest<IModels>({
          baseURL: process.env.NODE_ENV === 'production' ? '' : '${rapUrl}/api/app/mock/${projectId}'
          ${versionId ? `,params: {__ver: ${versionId}}` : ''}
        })

        ${basePathStr}

        http.interceptors.request.use(createSeprateInterceptor(POS_MAP))

        export const fetch = createFallbackFetch<IModels>(http)

        export default http
        `;
      },
    },
    {
      filePath: `${rapperPath}/index.ts`,
      template: () => {
        return `
        import { IModels } from './models'

        export type Models = IModels
        export * from './http'
        export * from './models'
        `;
      },
    },
  ];
  await tsCreator.write(templateList);
}
