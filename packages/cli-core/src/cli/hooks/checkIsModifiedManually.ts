const chalk = require('chalk')
import { findChangeFiles } from '../../core/scanFile'
import { templateFilesOverwriteConfirm } from '../../utils/index'
import type { Rapper } from '../rapper'

export async function checkIsModifiedManually(rapper: Rapper) {
  /** Scan to find out whether the generated template file has been manually modified */
  rapper.spinner.start(chalk.grey('rapper: check whether the template code has been modified'))
  const changeFiles = findChangeFiles(rapper.params.rapperPath || '')
  if (changeFiles.length) {
    rapper.spinner.warn(
      chalk.yellow('rapper: detect the following template code has been modified'),
    )
    changeFiles.forEach((str) => {
      console.log(chalk.yellow(`    ${str}`))
    })
    const { confirmed } = await templateFilesOverwriteConfirm()
    if (!confirmed) {
      console.log(chalk.red('Update operation has been terminated'))
      process.exit(0)
    }
  } else {
    rapper.spinner.succeed(chalk.grey('rapper: the template code has not been modified'))
  }
}
