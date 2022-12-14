const chalk = require('chalk')

export function checkConfigVerify(config: Record<string, any> | Record<string, any>[] = {}) {
  if (!!config && (Array.isArray(config) || typeof config === 'object')) {
    const requiredFields = ['projectId', 'token']
    if (Array.isArray(config)) {
      const verified = config.every((configItem) =>
        requiredFields.every((key) => !!configItem[key]),
      )
      if (!verified) {
        console.log(chalk.red(`${requiredFields.join(',')} missed in config`))
        process.exit(1)
      }
      return true
    }
    const verified = requiredFields.every((key) => !!config[key])
    if (!verified) {
      console.log(chalk.red(`${requiredFields.join(',')} missed in config`))
      process.exit(1)
    }
    return true
  } else {
    console.log(config, chalk.red('rapper: invalid rapper config'))
  }
}
