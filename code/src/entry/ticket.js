import './system/map'
import '@uyun/runtime'
import '~/common/common'
import React, { Component, Suspense, lazy } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { LocaleProvider, BackTop } from '@uyun/components'
import moment from 'moment'
import { store as runtimeStore } from '@uyun/runtime-react'
import NotFound from '~/components/notFound'
import stores from '~/stores'
import styles from './index.module.less'
import '../app/common/staticVariable'

import enUS from '@uyun/components/es/locale-provider/en_US'
import zhCN from '@uyun/components/es/locale-provider/zh_CN'
import './ticket.less'

import 'moment/locale/zh-cn'
moment.locale('zh-cn')
export default class App extends Component {
  render() {
    return (
      <LocaleProvider locale={runtimeStore.getState().language !== 'zh_CN' ? enUS : zhCN}>
        <HashRouter>
          <Provider {...stores}>
            <Suspense fallback={() => null}>
              <div className="ticketHtmlWrap" id="itsm-wrap">
                <Switch>
                  <Route
                    exact
                    path="/createService/:id"
                    component={lazy(() => import('~/service'))}
                  />
                  <Route
                    exact
                    path="/ticket/detail/:id"
                    component={lazy(() => import('~/details'))}
                  />
                  <Route
                    exact
                    path="/ticket/drafts/:id"
                    component={lazy(() => import('~/iframePage/draftTicket'))}
                  />
                  <Route
                    exact
                    path="/ticket/agile/:type"
                    component={lazy(() => import('~/list'))}
                  />
                  <Route path="*" component={NotFound} />
                </Switch>
                <BackTop
                  target={() => document.getElementById('itsm-wrap')}
                  visibilityHeight={200}
                />
              </div>
            </Suspense>
          </Provider>
        </HashRouter>
      </LocaleProvider>
    )
  }
}

function render(Component) {
  ReactDOM.render(<Component />, document.getElementById('main'))
}

render(App)
