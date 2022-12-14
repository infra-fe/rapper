import path from 'path'
import fs from 'fs'
import { checkConfigVerify } from '../utils/index'
const chalk = require('chalk')

export function getConfigFromRapConfig() {
  console.log(chalk.green('Start reading config from ./rap.config.js'), process.cwd())
  const rapConfigPath = path.resolve(process.cwd(), './rap.config.js')
  if (!fs.existsSync(rapConfigPath)) {
    console.log(chalk.yellow(`rap.config.js didn't exist...`))
    return null
  }
  console.log(chalk.green(`Find rap.config.js, will read config from rap.config.js`))
  const rapConfig = require(rapConfigPath)
  if (checkConfigVerify(rapConfig)) {
    console.log(chalk.green('End to read config from ./rap.config.js'))
    return rapConfig
  }
  return null
}
