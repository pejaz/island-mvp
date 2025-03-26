import cac from 'cac'
import { resolve } from 'path'
import { createDevServer } from './dev'
import { build } from './build'
// import { version } from '../../package.json'
// const version = require('../../package.json').version
const cli = cac('island').version('0.0.1').help()

cli
  .command('[root]', 'start dev server')
  .alias('dev')
  .action(async (root: string) => {
    console.log('dev', root)
    root = root ? resolve(root) : process.cwd()
    const server = await createDevServer(root)
    await server.listen()
    server.printUrls()
  })

cli
  .command('build [root]', 'build for production')
  .action(async (root: string) => {
    console.log('build', root)
    try {
      root = resolve(root)
      build(root)
    } catch (error) {
      console.log(error)
    }
  })

cli.parse()
