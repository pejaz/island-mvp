import { Content } from '@runtime'
import { Island } from '../components/Island'
import '../styles/base.css'
import '../styles/vars.css'
import styles from './index.module.scss' // not build in bundle aseet

export function Layout() {
  return (
    <div className={styles.treeShakeColor}>
      <section
        style={{
          paddingTop: 'var(--island-nav-height)',
        }}
      >
        <Island __island>
          demo test vite css 
        </Island>
      </section>
      <Content />
    </div>
  )
}
