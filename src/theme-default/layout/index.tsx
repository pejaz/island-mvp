import { usePageData } from '@runtime'
import 'uno.css'

export function Layout() {
  const pageData = usePageData()
  // 获取 pageType
  const { pageType } = pageData
  // 根据 pageType 分发不同的页面内容
  const getContent = () => {
    if (pageType === 'doc') {
      return <div>正文页面</div>
    } else {
      return <div>404 页面</div>
    }
  }

  return (
    <div>
      <h1 p="2" m="4" className="bg-red-500">
        Common Content
      </h1>
      <h1>Doc Content</h1>
      <div>{getContent()}</div>
    </div>
  )
}
