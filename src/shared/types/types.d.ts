declare module 'island:site-data' {
  import type { UserConfig } from '../shared/types/index'
  const siteData: UserConfig
  export default siteData
}

declare module 'island:routes' {
  import type { Route } from 'node/plugin-routes'
  const routes: Route[]
  export { routes }
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}
