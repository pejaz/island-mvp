import { useState, useEffect } from 'react'
import { Header } from 'shared/types/index'

export function useHeaders(initHeaders: Header[]) {
  const [headers, setHeaders] = useState(initHeaders)

  useEffect(() => {
    if (import.meta.env.DEV) {
      import.meta.hot.on(
        'mdx-changed',
        ({ filePath }: { filePath: string }) => {
          // 参考 vite热更新时的处理方式
          import(/* @vite-ignore */ `${filePath}?t=${Date.now()}`).then(
            (module) => {
              setHeaders(module.toc)
            }
          )
        }
      )
    }
  })
  return headers
}
