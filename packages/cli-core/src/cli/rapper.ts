const chalk = require('chalk');
const ora = require('ora');
import { Ora } from 'ora';
import * as url from 'url';
import { checkIsModifiedManually, checkRapperVersion, verifyParams } from './hooks';

import { findDeleteFiles } from '../core/scanFile';
import { getInterfaces, getIntfWithModelName, uniqueItfs } from '../core/tools';
import { getOldProjectId, templateFilesRelyConfirm } from '../utils';

import { Intf } from '../types/common';
import { IRapperParams } from '../types/rapper';

type TypeHookFunction = (rapper: Rapper) => void | Promise<any>;

export class Rapper {
  private beforeHooks: TypeHookFunction[] = [
    checkRapperVersion,
    verifyParams,
    checkIsModifiedManually,
  ];
  private afterHooks: TypeHookFunction[] = [];
  projectId: number = -1;
  params: IRapperParams;
  interfaces: Array<Intf> = [];
  basePath: string = '';
  spinner: Ora = ora(chalk.grey('rapper: start to check version'));
  constructor(
    params: IRapperParams,
    config?: {
      beforeHooks?: TypeHookFunction[];
      afterHooks?: TypeHookFunction[];
    },
  ) {
    this.params = params;
    this.beforeHooks = [...this.beforeHooks, ...(config?.beforeHooks || [])];
    this.afterHooks = [...(config?.afterHooks || []), ...this.afterHooks];
  }
  async run() {
    await Promise.all(this.beforeHooks.map(fn => fn(this)));
    this.parseParams();
    this.initProjectId();
    await this.startFetchInterface();
    await this.checkIsProjectIdChanged();
    // TODO: run logic here
    await Promise.all(this.afterHooks.map(fn => fn(this)));
  }
  private initProjectId() {
    const apiParams = url.parse(this.params.apiUrl, true).query;
    const id = apiParams.id || '';
    this.projectId = parseInt(Array.isArray(id) ? id[0] : id);
  }
  private parseParams() {
    this.params.rapperPath = this.params?.rapperPath?.replace(/\/$/, '');
    this.params.rapUrl = this.params?.rapUrl?.replace(/\/$/, '');
    this.params.apiUrl = this.params?.apiUrl?.replace(/\/$/, '');
  }

  private async startFetchInterface() {
    let interfaces: Array<Intf> = [];
    const { rapUrl, apiUrl, urlMapper } = this.params;
    this.spinner.start(chalk.grey('rapper: getting interface information from Rap platform...'));
    try {
      const res = await getInterfaces(apiUrl);
      interfaces = res.interfaces;
      this.basePath = res.basePath;
      this.interfaces = uniqueItfs(getIntfWithModelName(rapUrl || '', interfaces, urlMapper));
      this.spinner.succeed(chalk.grey('rapper: get interface information succeeded'));
    } catch (e) {
      this.spinner.fail(chalk.red(`rapper: get interface information failed，${e}`));
      process.exit(1002);
    }
  }

  private async checkIsProjectIdChanged() {
    /** Rap interface reference scanning, if the projectId is changed, it will not be scanned again, avoiding too many error messages to be displayed in the Terminal */
    const { rapperPath } = this.params;
    this.spinner.start(chalk.grey('rapper: Scanning for interface dependencies'));
    if (getOldProjectId(rapperPath || '') === String(this.projectId)) {
      const scanResult = findDeleteFiles(this.interfaces, [rapperPath || '']);
      if (scanResult.length && scanResult.length < 5) {
        this.spinner.warn(
          chalk.yellow(
            'rapper: The following files use interfaces that have been deleted or modified by Rap',
          ),
        );
        scanResult.forEach(({ key, filePath, start, line }) => {
          console.log(chalk.yellow(`    Interface: ${key}, located: ${filePath}:${line}:${start}`));
        });
        const { confirmed } = await templateFilesRelyConfirm();
        if (!confirmed) {
          console.log(chalk.red('Update operation has been terminated'));
          process.exit(1003);
        }
      } else {
        this.spinner.succeed(chalk.grey('rapper: no illegal dependencies found'));
      }
    } else {
      this.spinner.succeed(chalk.grey('rapper: no illegal dependencies found'));
    }
  }
}
