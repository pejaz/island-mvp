import type { ComponentType } from 'react'
import { UserConfig as ViteConfiguration } from 'vite'

export type NavItemWithLink = {
  text: string
  link: string
}

export interface Sidebar {
  [path: string]: SidebarGroup[]
}

export interface SidebarGroup {
  text?: string
  items: SidebarItem[]
}

export type SidebarItem =
  | { text: string; link: string }
  | { text: string; link?: string; items: SidebarItem[] }

export interface ThemeConfig {
  nav?: NavItemWithLink[]
  sidebar?: Sidebar
  footer?: Footer
}

export interface Footer {
  message?: string
  copyright?: string
}

export interface UserConfig {
  title?: string
  description?: string
  themeConfig?: ThemeConfig
  vite?: ViteConfiguration
}

export interface SiteConfig {
  root: string
  configPaths: string[]
  siteData: UserConfig
}

export type PageType = 'home' | 'doc' | 'custom' | '404'

export interface Header {
  id: string
  text: string
  depth: number
}

export interface FrontMatter {
  title?: string
  description?: string
  pageType?: PageType
  sidebar?: boolean
  outline?: boolean
  features?: Feature[]
  hero?: Hero
}

export interface PageData {
  siteData: UserConfig
  pagePath: string
  frontmatter: FrontMatter
  pageType: PageType
  title: string
  toc?: Header[]
}

export interface PageModule {
  default: ComponentType
  frontmatter?: FrontMatter
  toc?: Header[]
  title?: string
  [key: string]: unknown
}

export interface Feature {
  icon: string
  title: string
  details: string
}

export interface Hero {
  name: string
  text: string
  tagline: string
  image?: {
    src: string
    alt: string
  }
  actions: {
    text: string
    link: string
    theme: 'brand' | 'alt'
  }[]
}

export type PropsWithIsland = {
  __island?: boolean
}
