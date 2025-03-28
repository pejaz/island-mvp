import { createServer as createViteDevServer } from 'vite'
import { pluginIndexHtml } from './plugin-island/indexHtml'
import pluginReact from '@vitejs/plugin-react'
import { resolveConfig } from './config'
import { pluginConfig } from './plugin-island/config'
import { PACKAGE_ROOT } from './constants'
import { pluginRoutes } from './plugin-routes'

export async function createDevServer(
  root = process.cwd(),
  restart: () => Promise<void>
) {
  const config = await resolveConfig(root, 'serve', 'development')

  return createViteDevServer({
    root: PACKAGE_ROOT, // 移至 pluginConfig 中的 config 钩子
    plugins: [
      pluginIndexHtml(),
      pluginReact({ jsxRuntime: 'automatic' }),
      pluginConfig(config, restart),
      pluginRoutes({
        root: config.root,
      }),
    ],
    // server: {
    //   fs: {
    //     allow: [PACKAGE_ROOT],
    //   },
    // },
  })
}
