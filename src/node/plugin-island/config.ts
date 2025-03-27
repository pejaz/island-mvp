import { relative } from 'path'
import { SiteConfig } from 'shared/types/index'
import { Plugin } from 'vite'

const SITE_DATA_ID = 'island:site-data'

export function pluginConfig(
  config: SiteConfig,
  restart: () => Promise<void>
): Plugin {
  // let server: ViteDevServer | null = null

  return {
    name: SITE_DATA_ID,
    resolveId(id) {
      if (id === SITE_DATA_ID) {
        return `\0${SITE_DATA_ID}`
      }
    },
    load(id) {
      if (id === `\0${SITE_DATA_ID}`) {
        return `export default ${JSON.stringify(config.siteData)}`
      }
    },
    // 通过 configureServer 获取到 viteDevServer 实例
    // configureServer(s) {
    //   server = s
    // },
    async handleHotUpdate(ctx) {
      const customWatchedFiles = [config.configPath]
      const include = (id: string) =>
        customWatchedFiles.some((file) => id.includes(file))

      if (include(ctx.file)) {
        console.log(`\n${relative(config.root, ctx.file)} changed...`)

        // 重启 Server
        // 方案讨论：
        // 1. 插件内重启 Vite 的 dev server
        // await server?.restart()
        // ❌ 没有作用，因为并没有执行 Island 框架配置的重新读取
        // 2. 手动调用 dev.ts 中的 createDevServer方法
        await restart()
      }
    },
  }
}
