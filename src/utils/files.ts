import * as path from 'path'
import * as fs from 'fs'
import got from 'got'
import { v4 as uuid } from 'uuid'

/**
 * download image to tmp dir and return file path
 */
export async function downloadFile(url: string): Promise<string> {
  return new Promise((resolve, reject): void => {
    const fileName = uuid()
    const file = path.resolve(getTmpDir(), fileName)
    const writer = fs.createWriteStream(file)
    got(url, {
      method: 'GET',
      isStream: true,
    })
      .on('response', resp => {
        const contentType = resp.headers['content-type']
        if (!contentType || !contentType.startsWith('image')) {
          reject(new Error(`This url is not image: ${url}: ${contentType}`))
        }
      })
      .pipe(writer)
    writer.on('finish', () => resolve(file))
    writer.on('error', reject)
  })
}

export function getTmpDir(): string {
  const tmpDir = path.resolve(process.cwd(), 'tmp')
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir)
  }
  return tmpDir
}
