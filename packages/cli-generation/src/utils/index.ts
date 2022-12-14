import crypto from 'crypto'
import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import { IGeneratedCode } from '../types/common'

export function withoutExt(p: string) {
  return p.replace(/\.[^/.]+$/, '')
}

export function relativeImport(from: string, to: string) {
  return withoutExt('./' + path.relative(path.dirname(from), to))
}

export function mixGeneratedCode(codeArr: Array<IGeneratedCode>) {
  const imports = codeArr.map((c) => c.import)
  const bodies = codeArr.map((c) => c.body)
  const _exports = codeArr.map((c) => c.export)
  return `
    ${imports.join('\n')}
    ${bodies.join('\n')}
    ${_exports.join('\n')}
  `
}

export function writeFile(filepath: string, contents: string) {
  return new Promise<void>((resolve, reject) => {
    mkdirp(path.dirname(filepath))
      .then(() => {
        fs.writeFile(filepath, contents, (err) => {
          if (err) return reject(`filepath: ${filepath}, ${err}`)
          resolve()
        })
      })
      .catch((err) => {
        return reject(`filepath: ${filepath}, ${err}`)
      })
  })
}

/**
 * Whether the command is executed in the root directory
 */
export function isInRoot() {
  const cwd = process.cwd()
  const flag = fs.existsSync(path.resolve(cwd, 'package.json'))
  return flag
}

/** Get file md5 */
export function getMd5(fileContent: string) {
  const hash = crypto.createHash('md5')
  hash.update(fileContent)
  return hash.digest('hex')
}

export function getOldProjectId(rappperPath: string): string | undefined {
  const indexPath = path.resolve(process.cwd(), rappperPath, './index.ts')
  try {
    const content = fs.readFileSync(indexPath, 'utf-8') || ''
    const projectIdStr = content.split('\n')[1] || ''
    const matchArr = projectIdStr.match(/\/\*\sRap repository id:\s(\S*)\s\*\//) || []
    return matchArr[1]
  } catch (err) {
    return undefined
  }
}
