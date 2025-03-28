import cac from 'cac'
import { resolve } from 'path'
import { build } from './build'
import { resolveConfig } from './config'
// import { version } from '../../package.json'
// const version = require('../../package.json').version
const cli = cac('island').version('0.0.1').help()

cli
  .command('[root]', 'start dev server')
  .alias('dev')
  .action(async (root: string) => {
    console.log('dev', root)
    const createServer = async () => {
      const { createDevServer } = await import('./dev')
      root = root ? resolve(root) : process.cwd()
      const server = await createDevServer(root, async () => {
        await server.close()
        await createServer()
      })
      await server.listen()
      server.printUrls()
    }

    createServer()
  })

cli
  .command('build [root]', 'build for production')
  .action(async (root: string) => {
    console.log('build', root)
    try {
      root = resolve(root)
      const config = await resolveConfig(root, 'build', 'production')
      build(root, config)
    } catch (error) {
      console.log(error)
    }
  })

cli.parse()
