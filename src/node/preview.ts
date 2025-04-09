import compression from 'compression'
import polka from 'polka'
import path from 'path'
import sirv from 'sirv'

const DEFAULT_PORT = 4173

export async function preview(root: string, { port }: { port?: number }) {
  const listenPort = port ?? DEFAULT_PORT
  const outputDir = path.resolve(root, 'build')

  const compress = compression()

  // 静态资源服务
  const serve = sirv(outputDir, {
    etag: true,
    maxAge: 31536000,
    immutable: true,
    setHeaders(res, pathname) {
      if (pathname.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache')
      }
    },
  })

  const onNoMatch: polka.Options['onNoMatch'] = (req, res) => {
    res.statusCode = 404
    res.end("404 Not Found")
  }

  polka({ onNoMatch })
    .use(compress, serve)
    .listen(listenPort, (err) => {
      if (err) {
        throw err
      }
      console.log(
        `> Preview server is running at http://localhost:${listenPort}`
      )
    })
}
