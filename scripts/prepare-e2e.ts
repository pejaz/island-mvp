import path from 'path'
import fse from 'fs-extra'
import * as execa from 'execa'

const ROOT = path.resolve(__dirname, '../')
const exampleDir = path.resolve(__dirname, '../e2e/playground/basic')
const defaultExecaOpts = {
  stdout: process.stdout,
  stdin: process.stdin,
  stderr: process.stderr,
}

async function prepareE2E() {
  // ensure after build
  if (!fse.existsSync(path.resolve(__dirname, '../dist'))) {
    // exec build command
    execa.execaCommandSync('pnpm build', {
      cwd: ROOT,
    })
  }

  execa.execaCommandSync('npx playwright install', {
    cwd: ROOT,
    ...defaultExecaOpts,
  })

  execa.execaCommandSync('pnpm i', {
    cwd: exampleDir,
    ...defaultExecaOpts,
  })

  // exec dev command
  execa.execaCommandSync('pnpm dev', {
    cwd: exampleDir,
    ...defaultExecaOpts,
  })
}

prepareE2E()
