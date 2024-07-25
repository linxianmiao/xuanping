import './system/map'
import '@uyun/runtime'

import '~/common/common'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { store as runtimeStore } from '@uyun/runtime-react'
import { LocaleProvider } from '@uyun/components'
import Layout from '@uyun/layout'

import Details from '~/details'
import ServiceTicket from '~/service'
import NotFound from '~/components/notFound'
import DraftTicket from '~/iframePage/draftTicket'
import stores from '~/stores'

import enUS from '@uyun/components/es/locale-provider/en_US'
import zhCN from '@uyun/components/es/locale-provider/zh_CN'
import _ from 'lodash'
window._ = _
export default class App extends Component {
  render() {
    return (
      <LocaleProvider locale={runtimeStore.getState().language !== 'zh_CN' ? enUS : zhCN}>
        <HashRouter>
          <Provider {...stores}>
            <div style={{ overflowY: 'auto' }} className="content-wrap">
              <Switch>
                <Route exact path="/createService/:id" component={ServiceTicket} />
                <Route exact path="/ticket/detail/:id" component={Details} />
                <Route exact path="/ticket/drafts/:id" component={DraftTicket} />
                <Route path="*" component={NotFound} />
              </Switch>
            </div>
          </Provider>
        </HashRouter>
      </LocaleProvider>
    )
  }
}

function render(Component) {
  ReactDOM.render(
    <Layout.Boundary>
      <Component />
    </Layout.Boundary>,
    document.getElementById('main')
  )
}

render(App)
