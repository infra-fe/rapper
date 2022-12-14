import type { Intf, IOutputFiles } from '@rapper3/cli-generation';
import { BaseCreator, getTsModelTemplate } from '@rapper3/cli-generation';
import { IRapperConfig } from '../types/index';

export async function transIntfs2TsFile(intfList: Intf[], rapperConfig?: IRapperConfig) {
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
      filePath: `${rapperPath}/index.ts`,
      template: () => {
        return `
        import { IModels } from './models'
        
        export type Models = IModels
        export * from './models'
        `;
      },
    },
  ];
  await tsCreator.write(templateList);
}
