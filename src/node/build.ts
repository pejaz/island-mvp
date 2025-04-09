import fs from 'fs-extra'
import ora from 'ora'
import path, { dirname, join } from 'path'
import type { RollupOutput } from 'rollup'
import { SiteConfig } from 'shared/types'
import { InlineConfig, build as viteBuild } from 'vite'
import {
  CLIENT_ENTRY_PATH,
  EXTERNALS,
  MASK_SPLITTER,
  PACKAGE_ROOT,
  SERVER_ENTRY_PATH,
} from './constants'
import { createVitePlugins } from './vitePlugins'
import type { RouteObject } from 'react-router-dom'
import type { ssrRenderReturn } from 'runtime/ssr-entry'

const CLIENT_OUTPUT = 'build'

export async function bundle(root: string, config: SiteConfig) {
  const resolveViteConfig = (isServer: boolean): InlineConfig => ({
    mode: 'production',
    root,
    plugins: createVitePlugins(Object.assign(config, { isSSR: isServer })),
    ssr: {
      // 注意加上这个配置，防止 cjs 产物中 require ESM 的产物，因为 react-router-dom 的产物为 ESM 格式
      // 这样配置后会把 react-router-dom 的产物一起打包进产物中，就不需要去 require 第三方 esm 模块了
      noExternal: ['react-router-dom', 'lodash-es'],
    },
    build: {
      minify: false,
      ssr: isServer,
      outDir: isServer ? join(root, '.temp') : join(root, CLIENT_OUTPUT),
      rollupOptions: {
        treeshake: false, // work build css module to bundle asset
        input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
        output: {
          format: isServer ? 'cjs' : 'esm',
        },
        external: EXTERNALS,
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

    // 复制 vendors 目录到输出目录
    await fs.copy(join(PACKAGE_ROOT, 'vendors'), join(root, CLIENT_OUTPUT))
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput]
  } catch (error) {
    spinner.fail('Build client + server bundles failed!')
    console.log(error)
  }
}

const normalizeVendorFilename = (fileName: string) =>
  fileName.replace(/\//g, '_') + '.js'

export async function renderPage(
  render: ( path: string) => Promise<ssrRenderReturn>,
  routes: RouteObject[],
  root: string,
  clientBundle: RollupOutput
) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.isEntry
  )
  const styleAssets = clientBundle.output.filter(
    (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
  )
  const tasks = routes.map((route) => async () => {
    const routePath = route.path
    const {
      appHtml,
      islandToPathMap,
      islandProps = [],
    } = await render(routePath)
    const islandBundle = await buildIslands(root, islandToPathMap)
    // 也可以通过产物的 fileName 属性来注入
    const islandsCode = (islandBundle as RollupOutput).output[0].code
    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>title</title>
    <meta name="description" content="xxx">
    ${styleAssets
      .map((item) => `<link rel="stylesheet" href="/${item.fileName}">`)
      .join('\n')}
  </head>
  <body>
    <div id="root">${appHtml}</div>
     <script type="module">${islandsCode}</script>
    <script type="module" src="/${clientChunk?.fileName}"></script>
    <script id="island-props">${JSON.stringify(islandProps)}</script>
    <script type="importmap">
      {
        "imports": {
          ${EXTERNALS.map(
            (name) => `"${name}": "/${normalizeVendorFilename(name)}"`
          ).join(',')}
        }
      }
    </script>
  </body>
</html>`.trim()

    const fileName = routePath.endsWith('/')
      ? `${routePath}index.html`
      : `${routePath}.html`
    await fs.ensureDir(join(root, CLIENT_OUTPUT, dirname(fileName)))
    await fs.writeFile(join(root, CLIENT_OUTPUT, fileName), html)
  })

  for await (const task of tasks) {
    await task()
  }

  await fs.remove(join(root, '.temp'))
  await fs.remove(join(root, 'vendors'))
}

/**
 * { Aside: 'xxx' }
 * 编译后：
 * import { Aside } from 'xxx'
 * window.ISLANDS = { Aside }
 * window.ISLAND_PROPS = JSON.parse(
 *   document.getElementById('island-props').textContent // island 组件上的 props数组，通过 index索引 获取
 * )
 */
async function buildIslands(
  root: string,
  islandPathToMap: Record<string, string>
) {
  // 根据 islandPathToMap 拼接模块代码内容
  const islandsInjectCode = `
    ${Object.entries(islandPathToMap)
      .map(
        ([islandName, islandPath]) =>
          `import { ${islandName} } from '${islandPath}'`
      )
      .join(';')}
window.ISLANDS = { ${Object.keys(islandPathToMap).join(', ')} };
window.ISLAND_PROPS = JSON.parse(
  document.getElementById('island-props').textContent
);
  `
  const injectId = 'island:inject'
  return viteBuild({
    mode: 'production',
    esbuild: {
      jsx: 'automatic',
    },
    build: {
      // 输出目录
      outDir: path.join(root, '.temp'),
      rollupOptions: {
        input: injectId,
        external: EXTERNALS,
      },
    },
    plugins: [
      // 重点插件，用来加载我们拼接的 Islands 注册模块的代码
      {
        name: 'island:inject',
        enforce: 'post',
        resolveId(id) {
          if (id.includes(MASK_SPLITTER)) {
            const [originId, importer] = id.split(MASK_SPLITTER)
            return this.resolve(originId, importer, { skipSelf: true })
          }

          if (id === injectId) {
            return `\0:${injectId}`
          }
        },
        load(id) {
          if (id === `\0:${injectId}`) {
            return islandsInjectCode
          }
        },
        // 对于 Islands Bundle，我们只需要 JS 即可，其它资源文件可以删除
        generateBundle(_, bundle) {
          for (const name in bundle) {
            if (bundle[name].type === 'asset') {
              delete bundle[name]
            }
          }
        },
      },
    ],
  })
}

export async function build(root: string = process.cwd(), config: SiteConfig) {
  // 1. bundle -> client 端 + server 端
  const [clientBundle] = await bundle(root, config)
  // 2. 引入 ssr-entry 服务端模块
  const serverEntryPath = join(root, '.temp/ssr-entry.js')
  // 3. 服务端渲染，产出 HTML String -> fs  HTML 产物输出到磁盘
  const { render, routes } = await import(serverEntryPath)
  await renderPage(render, routes, root, clientBundle)
}
