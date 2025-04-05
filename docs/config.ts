import { defineConfig } from '../dist'
import { getConfig } from './util'

export default defineConfig(getConfig({
  describe: 'Island SSG Framework111',
  themeConfig: {
    nav: [
      { text: "主页", link: "/" },
      { text: "指南", link: "/guide/" },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '教程',
          items: [
            {
              text: '快速上手',
              link: '/guide/a'
            },
            {
              text: '如何安装',
              link: '/guide/b'
            }
          ]
        }
      ]
    }
  },
}))