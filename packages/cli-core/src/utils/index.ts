import axios from 'axios';
import { execSync } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
import * as path from 'path';
import { get } from 'lodash';
import { IGeneratedCode } from '../types/common';
const chalk = require('chalk');

const { exec } = require('child_process');

function getPkgJson() {
  let packageJson: any = {};
  try {
    packageJson = require(path.resolve(process.cwd(), 'package.json'));
  } catch (error: any) {
    console.log(chalk.red(error.message));
  }
  return packageJson;
}

export function withoutExt(p: string) {
  return p.replace(/\.[^/.]+$/, '');
}

export function relativeImport(from: string, to: string) {
  return withoutExt('./' + path.relative(path.dirname(from), to));
}

export function mixGeneratedCode(codeArr: Array<IGeneratedCode>) {
  const imports = codeArr.map((c) => c.import);
  const bodies = codeArr.map((c) => c.body);
  const _exports = codeArr.map((c) => c.export);
  return `
    ${imports.join('\n')}
    ${bodies.join('\n')}
    ${_exports.join('\n')}
  `;
}

/**
 * Whether the command is executed in the root directory
 */
export function isInRoot() {
  const cwd = process.cwd();
  const flag = fs.existsSync(path.resolve(cwd, 'package.json'));
  return flag;
}

/** Get file md5 */
export function getMd5(fileContent: string) {
  const hash = crypto.createHash('md5');
  hash.update(fileContent);
  return hash.digest('hex');
}

export function getOldProjectId(rappperPath: string): string | undefined {
  const indexPath = path.resolve(process.cwd(), rappperPath, './index.ts');
  try {
    const content = fs.readFileSync(indexPath, 'utf-8') || '';
    const projectIdStr = content.split('\n')[1] || '';
    const matchArr = projectIdStr.match(/\/\*\sRap repository id:\s(\S*)\s\*\//) || [];
    return matchArr[1];
  } catch (err) {
    return undefined;
  }
}

/** Template file coverage confirmation */
export async function templateFilesOverwriteConfirm() {
  const question = [
    {
      name: 'confirmed',
      type: 'confirm',
      message: chalk.green(
        'It is detected that you have modified the template code generated by rapper. The newly generated template code will overwrite your modifications. Make sure to be continue？',
      ),
      default: false,
    },
  ];
  const answers = await inquirer.prompt(question);
  return answers;
}

/** The existence of interface dependency is confirmed to be deleted */
export async function templateFilesRelyConfirm() {
  const question = [
    {
      name: 'confirmed',
      type: 'confirm',
      message: chalk.green(
        'Do you confirm to synchronize the interface? (There will be a risk that the interface called on the page does not exist)?',
      ),
      default: false,
    },
  ];
  const answers = await inquirer.prompt(question);
  return answers;
}

/** Get the current package name */
export function getPackageName() {
  return getPkgJson()?.name;
}

export function getPackageRegistry() {
  let registryUrl: string = getPkgJson()?.publishConfig?.registry || '';
  if (!registryUrl) {
    registryUrl = execSync('npm config get registry').toString();
  }
  if (!registryUrl) {
    registryUrl = 'https://registry.npmjs.org';
  }
  return registryUrl.replace('\n', '').replace(/\/$/, '');
}

/** Get the latest version */
export async function latestVersion(packageName: string) {
  const registryUrl = getPackageRegistry();
  console.log(chalk.green(`rapper: registry url is ${registryUrl}`));
  const response = await axios.get(`${registryUrl}/${packageName}`, {
    timeout: 1000 * 10,
  });
  return get(response, `data['dist-tags'].latest`);
}
