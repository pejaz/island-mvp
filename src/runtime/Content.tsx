import { useRoutes } from 'react-router-dom'
import { routes } from 'island:routes'
// import A from '../../docs/guide/a'
// import B from '../../docs/b'
// import Index from '../../docs/guide/index'

// const routes = [
//   {
//     path: '/guide',
//     element: <Index />,
//   },
//   {
//     path: '/guide/a',
//     element: <A />,
//   },
//   {
//     path: '/b',
//     element: <B />,
//   },
// ]

export const Content = () => {
  // console.log('-->  [ routes ]  <--\n', routes)
  const routeElement = useRoutes(routes)
  return routeElement
}
