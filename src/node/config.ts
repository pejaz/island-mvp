import { resolve } from 'path'
import fs from 'fs-extra'
import { loadConfigFromFile } from 'vite'

import { SiteConfig, UserConfig } from 'shared/types/index'

type RawConfig =
  | UserConfig
  | Promise<UserConfig>
  | (() => UserConfig | Promise<UserConfig>)

function getUserConfigPath(root: string) {
  try {
    const supportConfigFiles = ['config.ts', 'config.js']
    const configPath = supportConfigFiles
      .map((file) => resolve(root, file))
      .find(fs.pathExistsSync)
    return configPath
  } catch (e) {
    console.error(`Failed to load user config: ${e}`)
    throw e
  }
}

export async function resolveUserConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'development' | 'production'
): Promise<[string[], UserConfig]> {
  // 1. 获取配置文件路径
  const configPath = getUserConfigPath(root)
  // 2. 读取配置文件的内容
  const result = await loadConfigFromFile(
    {
      command,
      mode,
    },
    configPath,
    root
  )

  if (result) {
    // console.log('>_<： ~ result:', result)
    const { config: rawConfig = {} as RawConfig, dependencies } = result
    // 三种情况:
    // 1. object
    // 2. promise
    // 3. function
    const userConfig = await (typeof rawConfig === 'function'
      ? rawConfig()
      : rawConfig)

    // 处理配置文件的依赖的热更新(只考虑 docs 文件夹下的依赖)，而不是指热更新配置文件 configPath
    const configPaths = dependencies.filter((file) => file.startsWith('docs'))

    return [configPaths, userConfig as UserConfig]
  } else {
    return [[configPath], {} as UserConfig]
  }
}

export async function resolveConfig(
  root: string,
  command: 'serve' | 'build',
  mode: 'development' | 'production'
) {
  const [configPaths, userConfig] = await resolveUserConfig(root, command, mode)
  const siteConfig: SiteConfig = {
    root,
    configPaths,
    siteData: resolveSiteDate(userConfig as UserConfig),
  }

  return siteConfig
}

export function defineConfig(config: UserConfig) {
  return config
}

function resolveSiteDate(userConfig: UserConfig): UserConfig {
  return {
    title: userConfig.title || 'Island',
    description: userConfig.description || 'SSG Framework',
    themeConfig: userConfig.themeConfig || {},
    vite: userConfig.vite || {},
  }
}
