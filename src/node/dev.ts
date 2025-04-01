import { createServer as createViteDevServer } from 'vite'
import { resolveConfig } from './config'
import { PACKAGE_ROOT } from './constants'
import { createVitePlugins } from './vitePlugins'

export async function createDevServer(
  root = process.cwd(),
  restart: () => Promise<void>
) {
  const config = await resolveConfig(root, 'serve', 'development')

  return createViteDevServer({
    root: PACKAGE_ROOT, // 移至 pluginConfig 中的 config 钩子
    plugins: createVitePlugins(
      Object.assign(config, { isSSR: false }),
      restart
    ),
    // server: {
    //   fs: {
    //     allow: [PACKAGE_ROOT],
    //   },
    // },
  })
}
