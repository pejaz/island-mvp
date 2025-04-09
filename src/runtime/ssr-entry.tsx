import { App, initPageData } from './App'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { DataContext } from './hooks'

export interface ssrRenderReturn {
  appHtml: string
  islandProps: string[]
  islandToPathMap: {
    __island: string
  }
}

// For ssr component render
export async function render(
  pagePath: string
): Promise<ssrRenderReturn> {
  // 生产 pageData
  const pageData = await initPageData(pagePath)
  const { clearIslandData, data } = await import('./jsx-runtime')

  clearIslandData()

  const appHtml = renderToString(
    <DataContext.Provider value={pageData}>
      <StaticRouter location={pagePath}>
        <App />
      </StaticRouter>
    </DataContext.Provider>
  )
  // 拿到 islands 组件相关数据
  const { islandProps, islandToPathMap } = data

  return {
    appHtml,
    islandProps,
    islandToPathMap,
  }
}

// 导出路由数据
export { routes } from 'island:routes'
