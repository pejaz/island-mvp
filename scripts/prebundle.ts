import path from 'path'
import fs from 'fs-extra'
import { build } from 'esbuild'
import resolve from 'resolve'
import { normalizePath } from 'vite'
import { EXTERNALS } from 'node/constants'

const PRE_BUNDLE_DIR = 'vendors'

async function preBundle(deps: string[]) {
  const flattenDepMap = {} as Record<string, string>
  deps.map((item) => {
    const flattedName = item.replace(/\//g, '_')
    flattenDepMap[flattedName] = item
  })
  const outputAbsolutePath = path.join(process.cwd(), PRE_BUNDLE_DIR)

  if (await fs.pathExists(outputAbsolutePath)) {
    await fs.remove(outputAbsolutePath)
  }

  // 调用 Esbuild 进行打包
  await build({
    entryPoints: flattenDepMap,
    outdir: PRE_BUNDLE_DIR,
    bundle: true,
    minify: true,
    splitting: true,
    format: 'esm',
    platform: 'browser',
    plugins: [
      // 因为 react 包都是 commonjs 规范，所以需要对 react 相关包进行重新导出 ESM 格式
      {
        name: 'pre-bundle',
        setup(build) {
          // bare import
          build.onResolve({ filter: /^[\w@][^:]/ }, async (args) => {
            if (!deps.includes(args.path)) {
              return
            }
            const isEntry = !args.importer
            const resolved = resolve.sync(args.path, {
              basedir: args.importer || process.cwd(),
            })
            return isEntry
              ? { path: resolved, namespace: 'dep' }
              : { path: resolved }
          })
          build.onLoad({ filter: /.*/, namespace: 'dep' }, async (args) => {
            const entryPath = normalizePath(args.path)
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const res = require(entryPath)
            // 拿出所有的具名导出
            const specifiers = Object.keys(res)
            // 因为 react 包都是 commonjs 规范，所以需要对 react 包进行重新导出 ESM 格式的入口代码
            return {
              contents: `export { ${specifiers.join(
                ','
              )} } from "${entryPath}"; export default require("${entryPath}")`,
              loader: 'js',
              resolveDir: process.cwd(),
            }
          })
        },
      },
    ],
  })
}

preBundle(EXTERNALS)
