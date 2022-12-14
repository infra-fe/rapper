#!/usr/bin/env node
import { program } from 'commander'
import { readConfig } from './readConfig/index'
import { invokeRun } from './utils/invokeRun'

run()

async function run() {
  program
    .option('--type <typeName>', 'set type: normal | redux | react | dto')
    .option('--apiUrl <apiUrl>', 'set Rap platform server url')
    .option('--rapUrl <rapUrl>', 'set Rap platform client url')
    .option('--rapperPath <rapperPath>', 'set generate code directory')
    .option('--resSelector <resSelector>', 'set response conversion data type')
    .option('--enumType <enumType>', 'set type: union | enum')

  program.parse(process.argv)
  const rapperConfigs = readConfig(program.opts())
  rapperConfigs.forEach(invokeRun)
}
