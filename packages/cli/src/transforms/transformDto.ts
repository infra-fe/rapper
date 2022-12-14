/*
 * @Author: xia xian
 * @Date: 2022-08-04 14:27:02
 * @LastEditors: xia xian
 * @LastEditTime: 2022-08-29 15:01:39
 * @Description:
 */
import {
  BaseCreator,
  getDtoTemplate,
  Intf,
  IOutputFiles,
  ITEM_EMPTY,
} from '@rapper3/cli-generation';
import { IRapperConfig } from '../types/index';

export async function transIntfs2DtoFile(intfList: Intf[], rapperConfig?: IRapperConfig) {
  const { rapperPath, rapUrl, projectId, versionId, enumType } = rapperConfig || {};
  const tsCreator = new BaseCreator(intfList, {
    rapUrl: rapUrl || '',
    projectId: projectId || -1,
    versionId,
    enumType,
  });
  const templateList: IOutputFiles[] = [];
  let hasEmpty = false;
  const entries = intfList.map((itf) => {
    const { url, method } = itf;
    const fileName =
      method.toLowerCase() + `${url.startsWith('/') ? '' : '-'}` + url.replace(/\//g, '-');
    const { str, req, res, empty } = getDtoTemplate(itf, rapUrl, { enumType });
    templateList.push({
      filePath: `${rapperPath}/${fileName}.dto.ts`,
      template: str,
    });
    if (empty) hasEmpty = empty;
    return { req, res, name: fileName };
  });
  const indexStr = `
  ${hasEmpty ? `export class ${ITEM_EMPTY} {}\n` : ''}
  ${entries.reduce((s, item) => {
    const { req, res, name } = item;
    return (s += `export {${req}, ${res}} from './${name}.dto'\n`);
  }, '')}`;
  templateList.push({
    filePath: `${rapperPath}/index.ts`,
    template: indexStr,
  });

  await tsCreator.write(templateList);
}
