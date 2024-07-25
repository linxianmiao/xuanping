import '~/common/common'
import React from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { store as runtimeStore } from '@uyun/runtime-react'
import { LocaleProvider } from '@uyun/components'

import Details from '~/details'
import ServiceTicket from '~/service'
import NotFound from '~/components/notFound'
import Layout from '~/iframePage/layout'
import DraftTicket from '~/iframePage/draftTicket'

import enUS from '@uyun/components/es/locale-provider/en_US'
import zhCN from '@uyun/components/es/locale-provider/zh_CN'

export default class App extends React.Component {
  render() {
    return (
      <LocaleProvider locale={runtimeStore.getState().language !== 'zh_CN' ? enUS : zhCN}>
        <HashRouter>
          <Layout>
            <Switch>
              <Route exact path="/createService/:id" component={ServiceTicket} />
              <Route exact path="/ticket/detail/:id" component={Details} />
              <Route exact path="/ticket/drafts/:id" component={DraftTicket} />
              <Route path="*" component={NotFound} />
            </Switch>
          </Layout>
        </HashRouter>
      </LocaleProvider>
    )
  }
}
