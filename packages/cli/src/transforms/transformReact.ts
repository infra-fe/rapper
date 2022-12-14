import type { Intf, IOutputFiles } from '@rapper3/cli-generation';
import { BaseCreator } from '@rapper3/cli-generation';
import { IRapperConfig } from '../types/index';

export async function transIntfs2ReactFile(intfList: Intf[], rapperConfig?: IRapperConfig) {
  const { rapperPath, rapUrl, projectId, versionId, enumType } = rapperConfig || {};
  const tsCreator = new BaseCreator(intfList, {
    rapUrl: rapUrl || '',
    projectId: projectId || -1,
    versionId,
    enumType,
  });
  const templateList: IOutputFiles[] = [
    {
      filePath: `${rapperPath}/useHttp.ts`,
      template: () => {
        return `
        import { createUseHttp } from '@rapper3/react-ahooks'
        import { http } from './http'
        import { IModels } from './models'

        export const useHttp = createUseHttp<IModels>(http)
        export const useFetch = useHttp
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
        export * from './useHttp'
        `;
      },
    },
  ];
  await tsCreator.write(templateList);
}
