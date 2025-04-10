import { routes } from 'island:routes'
import siteData from 'island:site-data'
import { matchRoutes } from 'react-router-dom'
import type { PageData } from 'shared/types'
import { Layout } from '../theme-default'
import type { Route } from 'node/plugin-routes'

export async function initPageData(routePath: string): Promise<PageData> {
  // 获取路由组件编译后的模块内容
  const matched = matchRoutes(routes, routePath)

  if (matched) {
    // Preload route component
    const moduleInfo = await (matched[0].route as Route).preload()

    return {
      pageType: moduleInfo.frontmatter?.pageType ?? 'doc',
      siteData,
      frontmatter: moduleInfo.frontmatter,
      toc: moduleInfo.toc,
      title: moduleInfo.title,
      pagePath: routePath,
    }
  }
  return {
    pageType: '404',
    siteData,
    pagePath: routePath,
    toc: [],
    title: '404',
    frontmatter: {},
  }
}

export function App() {
  return <Layout />
}
