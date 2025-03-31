import { Plugin } from 'vite'
import { pluginMdxRollup } from './pluginMdxRollup'

export function createPluginMdx(): Promise<Plugin>[] {
  return [pluginMdxRollup()]
}
