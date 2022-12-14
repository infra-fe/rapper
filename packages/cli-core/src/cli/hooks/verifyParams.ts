const chalk = require('chalk')
import type { Rapper } from '../rapper'
export function verifyParams(rapper: Rapper) {
  /** Parameter verification */
  const typeList = ['ts', 'http', 'normal', 'redux', 'react', 'dto']
  rapper.spinner.start(chalk.grey('rapper: start to check parameters'))
  if (!rapper.params.type) {
    rapper.spinner.fail(chalk.red('rapper: please config type parameter'))
    process.exit(1000)
  } else if (!typeList.includes(rapper.params.type)) {
    rapper.spinner.fail(
      chalk.red(
        `rapper: type parameter should be one of ${typeList.join(',')}, now receive ${
          rapper.params.type
        }`,
      ),
    ),
      process.exit(1001)
  }
  rapper.spinner.succeed(chalk.grey('rapper: parameters verified success'))
}
