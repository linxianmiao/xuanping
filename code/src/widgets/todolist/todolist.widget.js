import locale from './locale.json'
import TodoList from './TodoList.jsx'
import ListStore from './ListStore'

import { createReactWidget, I18n } from '@uyun/core'
import * as api from './api'
// createReactWidget 具体配置文档 http://npm.uyundev.cn/package/@uyun/core
export default createReactWidget({
  // 部件配置
  // config: require('./config'),
  // 路由配置
  routes: [],
  // 配置公共store
  globalProviders: [
    // { provide: "产品名称_组件名称_Store名称", useClass: 类 }
    // 例: { provid: "CMDB_DEMO_DEMOSTORE", useClass: DemoStore }
  ],
  // 配置私有store
  providers: [
    I18n(locale, 'i18n'),
    { provide: 'listStore', useClass: ListStore },
    { provide: 'api', useFactory: () => api, deps: [] }
  ],
  rootComponent: TodoList
})
