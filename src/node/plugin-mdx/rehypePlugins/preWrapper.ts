import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import type { Element, Root } from 'hast'

type PreElement = Element & { data: { isVisited?: boolean } }

export const rehypePluginPreWrapper: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: PreElement) => {
      // <pre><code>...</code></pre>
      // 1. 找到 pre 元素
      if (
        node.tagName === 'pre' &&
        node.children[0]?.type === 'element' &&
        node.children[0].tagName === 'code' &&
        !node.data?.isVisited
      ) {
        // 2. 解析出代码的语言名称
        const codeNode = node.children[0]
        const codeClassName = codeNode.properties?.className?.toString() || ''
        // language-xxx
        const lang = codeClassName.split('-')[1]
        // codeNode.properties.className = ''

        // 3. 变换 Html AST
        const clonedNode: PreElement = {
          type: 'element',
          tagName: 'pre',
          children: node.children,
          properties: node.properties,
          data: {
            ...node.data,
            isVisited: true,
          },
        }

        // 修改原来的 pre 标签 -> div 标签
        node.tagName = 'div'
        node.properties = node.properties || {}
        node.properties.className = codeClassName

        // 构造 div 标签的子元素
        node.children = [
          {
            type: 'element',
            tagName: 'span',
            properties: {
              className: 'lang',
            },
            children: [
              {
                type: 'text',
                value: lang,
              },
            ],
          },
          clonedNode,
        ]
      }
    })
  }
}
