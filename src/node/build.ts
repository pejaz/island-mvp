import { InlineConfig, build as viteBuild } from 'vite'
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from './constants'
import { join } from 'path'
import type { RollupOutput } from 'rollup'
import fs from 'fs-extra'
import ora from 'ora'
import { SiteConfig } from 'shared/types'
import { pluginConfig } from './plugin-island/config'
import pluginReact from '@vitejs/plugin-react'

export async function bundle(root: string, config: SiteConfig) {
  const resolveViteConfig = (isServer: boolean): InlineConfig => ({
    mode: 'production',
    root,
    plugins: [pluginReact(), pluginConfig(config)],
    ssr: {
      // 注意加上这个配置，防止 cjs 产物中 require ESM 的产物，因为 react-router-dom 的产物为 ESM 格式
      // 这样配置后会把 react-router-dom 的产物一起打包进产物中，就不需要去 require 第三方 esm 模块了
      noExternal: ['react-router-dom'],
    },
    build: {
      ssr: isServer,
      outDir: isServer ? '.temp' : 'build',
      rollupOptions: {
        input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
        output: {
          format: isServer ? 'cjs' : 'esm',
        },
      },
    },
  })
  const clientBuild = async () => {
    return viteBuild(resolveViteConfig(false))
  }

  const serverBuild = async () => {
    return viteBuild(resolveViteConfig(true))
  }

  const spinner = ora()

  try {
    spinner.start('Building client + server bundles...')
    const [clientBundle, serverBundle] = await Promise.all([
      // client build
      clientBuild(),
      // server build
      serverBuild(),
    ])

    spinner.succeed('Build client + server bundles successfully!')
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput]
  } catch (error) {
    spinner.fail('Build client + server bundles failed!')
    console.log(error)
  }
}

export async function renderPage(
  render: () => string,
  root: string,
  clientBundle: RollupOutput
) {
  const appHtml = render()
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.isEntry
  )
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>title</title>
      <meta name="description" content="xxx">
    </head>
    <body>
      <div id="root">${appHtml}</div>
      <script type="module" src="/${clientChunk?.fileName}"></script>
    </body>
  </html>`.trim()
  await fs.writeFile(join(root, 'build/index.html'), html)
  await fs.remove(join(root, '.temp'))
}

export async function build(root: string = process.cwd(), config: SiteConfig) {
  // 1. bundle -> client 端 + server 端
  const [clientBundle] = await bundle(root, config)
  // 2. 引入 ssr-entry 服务端模块
  const serverEntryPath = join(root, '.temp/ssr-entry.js')
  // 3. 服务端渲染，产出 HTML String -> fs  HTML 产物输出到磁盘
  const { render } = await import(serverEntryPath)
  await renderPage(render, root, clientBundle)
}
