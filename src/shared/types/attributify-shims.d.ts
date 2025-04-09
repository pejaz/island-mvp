import type { AttributifyAttributes } from 'unocss/preset-attributify'

declare module 'react' {
  interface HTMLAttributes extends AttributifyAttributes {}
}

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // 允许所有 HTML 元素使用 __island 属性
    __island?: boolean;
  }
}

declare module 'react' {
  interface Attributes {
    // 扩展所有 React 组件的属性定义
    __island?: boolean;
  }
}