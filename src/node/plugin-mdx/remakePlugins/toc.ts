import type { Plugin } from 'unified'
import Slugger from 'github-slugger'
import { visit } from 'unist-util-visit'
import { Root } from 'mdast'
import type { MdxjsEsm } from 'mdast-util-mdxjs-esm'
import { parse } from 'acorn'

interface TocItem {
  id: string
  text: string
  depth: number
}

interface ChildNode {
  type: 'link' | 'text' | 'inlineCode'
  value: string
  children?: ChildNode[]
}

export const remarkPluginToc: Plugin<[], Root> = () => {
  let title = ''
  return (tree) => {
    // 初始化 toc 数组
    const toc: TocItem[] = []
    // 每次编译时都重新进行实例的初始化
    const slugger = new Slugger()

    visit(tree, 'heading', (node) => {
      if (!node.depth || !node.children) {
        return
      }

      if (node.depth === 1) {
        title = (node.children[0] as ChildNode).value
      }

      // h2 ~ h4
      if (node.depth > 1 && node.depth < 5) {
        // node.children 是一个数组，包含几种情况:
        // 1. 文本节点，如 '## title'
        // 结构如下:
        // {
        //   type: 'text',
        //   value: 'title'
        // }
        // 2. 链接节点，如 '## [title](/path)'
        // 结构如下:
        // {
        //   type: 'link',
        //     {
        //       type: 'text',
        //       value: 'title'
        //     }
        //   ]
        // }
        // 3. 内联代码节点，如 '## `title`'
        // 结构如下:
        // {
        //   type: 'inlineCode',
        //   value: 'title'
        // }
        const originText = (node.children as ChildNode[])
          .map((child) => {
            switch (child.type) {
              case 'link':
                return child.children?.map((c) => c.value).join('') || ''
              default:
                return child.value
            }
          })
          .join('')

        // 对标题文本进行规范化
        const id = slugger.slug(originText)
        toc.push({
          id,
          text: originText,
          depth: node.depth,
        })
      }
    })

    const insertCode = `export const toc = ${JSON.stringify(toc, null, 2)};`

    tree.children.push({
      type: 'mdxjsEsm',
      value: insertCode,
      data: {
        estree: parse(insertCode, {
          ecmaVersion: 2020,
          sourceType: 'module',
        }),
      },
    } as MdxjsEsm)

    if (title) {
      const insertedTitle = `export const title = '${title}';`

      tree.children.push({
        type: 'mdxjsEsm',
        value: insertedTitle,
        data: {
          estree: parse(insertedTitle, {
            ecmaVersion: 2020,
            sourceType: 'module',
          }),
        },
      } as MdxjsEsm)
    }
  }
}
