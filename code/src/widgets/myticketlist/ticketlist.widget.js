import locale from './locale.json'
import { Ticketlist } from './ticketlist'
import { TicketlistStore } from './ticketlist.store'
import { UserPickStore } from './userpicker.store'
import ListStore from './ListStore'
import { createReactWidget, I18n } from '@uyun/core'
import * as api from './api'
import 'moment/locale/zh-cn'
import '../../../public/static/fonts/iconfont.css'
import '../../../public/static/fonts/iconfont.js'
// import locale from '@uyun/components/es/date-picker/locale/zh_CN'

// createReactWidget 具体配置文档 http://npm.uyundev.cn/package/@uyun/core
export default createReactWidget({
  // 部件配置
  //   config: require('./setting').default,
  // 路由配置
  routes: [],
  // 配置公共store
  globalProviders: [
    // { provide: "产品名称_组件名称_Store名称", useClass: 类 }
    // 例: { provid: "CMDB_DEMO_DEMOSTORE", useClass: DemoStore }
  ],
  // 配置私有store
  providers: [
    I18n(locale),
    TicketlistStore,
    UserPickStore,

    { provide: 'listStore', useClass: ListStore },
    // {
    //   provide: 'newStore',
    //   useFactory: (store, theme) => new Store(theme),
    //   des: ['theme']
    // },
    { provide: 'api', useFactory: () => api, deps: [] }
  ],
  rootComponent: Ticketlist
})
