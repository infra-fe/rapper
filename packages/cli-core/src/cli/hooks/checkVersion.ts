import * as semver from 'semver'
import { findRapperVersion } from '../../core/scanFile'
import { latestVersion } from '../../utils'
import type { Rapper } from '../rapper'
const chalk = require('chalk')

const packageJson = require('../../../package.json')

export async function checkRapperVersion(rapper: Rapper) {
  const curRapperVersion = packageJson.version
  /** check the version ands give an upgrade prompt */
  try {
    const newVersion = await latestVersion('@infra/rapper')
    if (newVersion && semver.lt(curRapperVersion, newVersion)) {
      rapper.spinner.warn(chalk.yellow('rapper upgrade notice: '))
      console.log(`  current version: ${chalk.grey(curRapperVersion)}`)
      console.log(`  latest version: ${chalk.cyan(newVersion)}`)
      // console.log(
      //   `  run ${chalk.green(`npm i -D ${packageJson.name}@latest && npm run rapper`)} can upgrade`,
      // );
    }
  } catch (err: any) {
    rapper.spinner.warn(`rapper version check failed，${err?.message}`)
  }

  /** Check whether the version of the current rapper is lower than the version of the old template code and force an upgrade */

  const oldFilesRapperVersion = findRapperVersion(rapper.params.rapperPath || '')
  console.log('  rapper: oldVersion', oldFilesRapperVersion)
  if (oldFilesRapperVersion && semver.lt(curRapperVersion, oldFilesRapperVersion)) {
    return new Promise(() => {
      rapper.spinner.fail(
        chalk.red(
          'rapper exec failed: current environment rapper version is lower than the version of the template file that has been generated. In order to avoid the lower version from overwriting the higher version, please upgrade',
        ),
      )
      console.log(`  current version: ${chalk.grey(curRapperVersion)}`)
      console.log(`  current template file version: ${chalk.cyan(oldFilesRapperVersion)}`)
    })
  }
}
