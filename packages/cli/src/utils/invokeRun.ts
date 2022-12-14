import { Rapper } from '@rapper3/cli-core';
import { writeFile } from '@rapper3/cli-generation';
import {
  transIntfs2DtoFile,
  transIntfs2HttpFile,
  transIntfs2ReactFile,
  transIntfs2TsFile,
} from '../transforms/index';
import { IRapperConfig } from '../types/index';

export async function invokeRun(rapperConfig: IRapperConfig) {
  const rapper = new Rapper(rapperConfig);
  await rapper.run();
  const { type } = rapperConfig;

  if (typeof rapperConfig.transform === 'function') {
    const outputFiles = rapperConfig.transform(rapper.interfaces, {
      writeTsFiles: () => transIntfs2TsFile(rapper.interfaces, rapperConfig),
      writeReactFiles: async () => {
        await transIntfs2TsFile(rapper.interfaces, rapperConfig);
        await transIntfs2ReactFile(rapper.interfaces, rapperConfig);
      },
      writeDtoFiles: () => transIntfs2DtoFile(rapper.interfaces, rapperConfig),
    });
    await outputFiles.map(async ({ filePath, template }) => {
      const content = typeof template === 'function' ? await template() : template;
      return writeFile(filePath, content || '');
    });
    return;
  }

  if (type === 'ts') {
    transIntfs2TsFile(rapper.interfaces, rapperConfig);
    return;
  }

  if (!type || type === 'normal' || type === 'http') {
    transIntfs2HttpFile(
      {
        basePath: rapper.basePath,
        intfList: rapper.interfaces,
      },
      rapperConfig,
    );
    return;
  }

  if (type === 'react') {
    await transIntfs2HttpFile(
      {
        basePath: rapper.basePath,
        intfList: rapper.interfaces,
      },
      rapperConfig,
    );
    transIntfs2ReactFile(rapper.interfaces, rapperConfig);
    return;
  }

  if (type === 'dto') {
    transIntfs2DtoFile(rapper.interfaces, rapperConfig);
    return;
  }
}
