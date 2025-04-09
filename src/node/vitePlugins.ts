import { pluginIndexHtml } from './plugin-island/indexHtml'
import pluginReact from '@vitejs/plugin-react'
import { pluginConfig } from './plugin-island/config'
import { pluginRoutes } from './plugin-routes'
import { SiteConfig } from 'shared/types'
import { PACKAGE_ROOT } from './constants'
import path from 'path'
import babelPluginIsland from './babel-plugin-island'

export function createVitePlugins(
  config: SiteConfig & { isSSR?: boolean },
  restartServer?: () => Promise<void>
) {
  return [
    pluginIndexHtml(),
    pluginReact({
      jsxRuntime: 'automatic',
      jsxImportSource: config.isSSR
        ? path.join(PACKAGE_ROOT, 'src', 'runtime') // react会自动在这个路径下寻找jsx-runtime.js 文件
        : 'react',
      babel: {
        plugins: [babelPluginIsland],
      },
    }),
    pluginConfig(config, restartServer),
    pluginRoutes({
      root: config.root,
      isSSR: config.isSSR,
    }),
  ]
}
