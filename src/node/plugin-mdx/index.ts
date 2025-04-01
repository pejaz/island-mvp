import { Plugin } from 'vite'
import { pluginMdxRollup } from './pluginMdxRollup'
import { pluginMdxHMR } from './pluginMdxHmr'

// Vite 热更新机制
// 1. 监听到文件变动
// 2. 定位到更新边界模块
// 3. 执行热更新逻辑

// import.meta.hot.accept()
// import.meta.hot.accept((mod) => {})
// import.meta.hot.accept([../index.mdx],(mod) => {})

export async function createPluginMdx(): Promise<Plugin[]> {
  return [await pluginMdxRollup(), pluginMdxHMR()]
}
