import path from 'path'
import { checkConfigVerify } from '../utils/index'
const chalk = require('chalk')

export function getConfigFromPkgJson() {
  console.log(chalk.green('Start reading config from package.json'))
  const packageConfig = require(path.resolve(process.cwd(), './package.json'))
  if (!packageConfig.rapper) {
    console.log(
      chalk.yellow(
        'Rapper has not been configured in package.json, please refer to the configuration manual',
      ),
    )
    return null
  }
  if (checkConfigVerify(packageConfig.rapper)) {
    console.log(chalk.green('End to read config from package.json'))
    return packageConfig.rapper
  }
  return null
}
