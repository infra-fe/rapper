/**
 * Scan the project file to exclude the existence of the rap interface has been deleted, but the project is still using the interface
 */
import * as fs from 'fs'
import * as path from 'path'
import { resolve } from 'path'
import { Intf } from '../types/common'
import { getMd5 } from '../utils'
const chalk = require('chalk')

/**
 * Get all the files that need to be scanned
 * @param parentPath
 */
function getFiles(parentPath: string): string[] {
  let fileList: string[] = []

  /* Do not scan for invalid paths */
  if (parentPath.indexOf('/.') > -1 || parentPath.indexOf('node_modules') > -1) {
    return fileList
  }

  let files: string[] = []
  try {
    files = fs.readdirSync(parentPath)
  } catch (err) {}

  files.forEach((item) => {
    item = path.join(parentPath, item)

    if (item.indexOf('src') < 0) {
      return
    }

    const stat = fs.statSync(item)
    try {
      if (stat.isDirectory()) {
        fileList = fileList.concat(getFiles(item))
      } else if (stat.isFile()) {
        fileList.push(item)
      }
    } catch (error) {
      console.log(chalk.red(`rapper: Rap interface reference scan failed, ${error}`))
    }
  })
  return fileList
}

/** Verify the file MD5, whether it has been changed */
function isFileChange(contentArr: string[]): boolean {
  const matchMD5 = contentArr[0].match(/\/\*\smd5:\s(\S*)\s\*\//) || []
  const oldMD5 = matchMD5[1]
  /** The old version is not written in md5, so it needs to be compatible here */
  if (!oldMD5) {
    return false
  }
  return oldMD5 !== getMd5(contentArr.slice(1).join('\n'))
}

type TScanResult = Array<{
  /** Deleted interface modelName */
  key: string
  /** The file containing the deleted interface */
  filePath: string
  /** The number of lines in the file */
  line: number
  /** The number of columns in the file */
  start: number
}>
function scanAllfiles(interfaces: Array<Intf>, fileList: string[]): TScanResult {
  const strReg =
    /[\'\"]+(GET|POST|PUT|DELETE|OPTIONS|PATCH|HEAD)\/([^\'\"]*)[^(REQUEST)(SUCCESS)(FAILURE)]{1}[\'\"]+/g

  const result: TScanResult = []
  fileList.forEach((filePath) => {
    /** File extension */
    const extName = path.extname(filePath)
    if (!['.ts', '.js', '.vue', '.es'].includes(extName)) {
      return
    }
    /** Read the contents of the file */
    const content = fs.readFileSync(filePath, 'utf-8') || ''
    /** Compare each row */
    content.split('\n').forEach((rowText, i) => {
      const regResult = rowText.match(strReg)
      if (regResult && regResult.length > 0) {
        regResult.forEach((item) => {
          item = item.replace(/\'|\"/gi, '')
          /** Can't find it in interfaces, indicating invalid Rap reference */
          const isExist = !!interfaces.find(({ modelName }) => modelName === item)
          if (!isExist) {
            result.push({
              key: item,
              filePath: resolve(process.cwd(), filePath),
              start: rowText.indexOf(item),
              line: i + 1,
            })
          }
        })
      }
    })
    return false
  })

  return result
}

/**
 * Scan to find out if there are any deleted interfaces
 * @param interfaces, Rap platform synchronization interface
 * @param excludePath, Exclude detected files (node_modules has been excluded by default, no need to configure this item)
 */
export function findDeleteFiles(interfaces: Array<Intf>, excludePaths: string[]) {
  let fileList = getFiles('./')
  fileList = fileList.filter((file) => {
    file = resolve(process.cwd(), file)
    return !excludePaths.find((exclude) => file.indexOf(resolve(process.cwd(), exclude)) > -1)
  })
  return scanAllfiles(interfaces, fileList)
}

/**
 * Scan to find out whether the generated template file has been manually modified
 * @param rapperPath, Template file address
 */
export function findChangeFiles(rapperPath: string): string[] {
  const fileList = getFiles(rapperPath)
  const changeList: string[] = []
  fileList.forEach((filePath) => {
    /** Read the contents of the file */
    const content = fs.readFileSync(filePath, 'utf-8') || ''
    /** Verify the file MD5, whether it has been changed */
    if (isFileChange(content.split(/\r|\n|\r\n/))) {
      changeList.push(resolve(process.cwd(), filePath))
    }
  })
  return changeList
}

/**
 * Scan from the first 6 lines of the template file to find the rapper version that generated the template file
 */
export function findRapperVersion(rapperPath: string): string {
  let version = ''
  try {
    const content = fs.readFileSync(`${rapperPath}/index.ts`, 'utf-8') || ''
    const contentArr = content.split(/\r|\n|\r\n/)
    if (contentArr.length) {
      const matchMD5 =
        contentArr
          .slice(0, 6)
          .join('\n')
          .match(/\/\*\sRapper version:\s(\S*)\s\*\//) || []
      version = matchMD5[1]
    }
  } catch (err) {}
  return version
}
