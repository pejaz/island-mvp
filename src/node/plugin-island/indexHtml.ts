import { Plugin } from 'vite'
import { readFile } from 'fs/promises'
import { CLIENT_ENTRY_PATH, DEFAULT_TEMPLATE_PATH } from '../constants'

export function pluginIndexHtml(): Plugin {
  return {
    name: 'island:index-html',
    apply: 'serve',
    // 插入入口 script 标签
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: `/@fs/${CLIENT_ENTRY_PATH}`,
            },
            injectTo: 'body',
          },
        ],
      }
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          try {
            // 1. 读取 template.html 的内容
            let html = await readFile(DEFAULT_TEMPLATE_PATH, 'utf-8')
            html = await server.transformIndexHtml(
              req.url,
              html,
              req.originalUrl
            )
            // 2. 响应 HTML  浏览器
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            res.end(html)
          } catch (e) {
            return next(e)
          }
        })
      }
    },
  }
}
