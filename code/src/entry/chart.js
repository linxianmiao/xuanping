import '@uyun/runtime'

import '~/common/common'
import React from 'react'
import ReactDOM from 'react-dom'
// import { Router, Route, hashHistory } from 'react-router'
import { Switch, Route, HashRouter } from 'react-router-dom'
import Layout from '@uyun/layout'
import _ from 'lodash'

import enUS from '@uyun/components/es/locale-provider/en_US'
import zhCN from '@uyun/components/es/locale-provider/zh_CN'

import { LocaleProvider } from '@uyun/components'
import NotFound from '~/components/notFound'
import ProcessIndex from '~/details/processIndex'
import PrintForm from '~/details/printIndex'

import { getCookie } from '~/utils'

window._ = _
window.skin = 'white'
// window.skin = getCookie('skin') || 'blue'
document.querySelector('html').className = 'white'
window.language = getCookie('language') || 'zh_CN'
ReactDOM.render(
  <Layout.Boundary>
    <LocaleProvider locale={window.language !== 'zh_CN' ? enUS : zhCN}>
      <HashRouter>
        <Switch>
          <Route exact path="/ticket/detail/:id" component={ProcessIndex} />
          <Route exact path="/createTicket/:id" component={ProcessIndex} />
          <Route exact path="/ticket/drafts/:id" component={ProcessIndex} />
          <Route exact path="/print/:id" component={PrintForm} />
          <Route exact path="*" component={NotFound} />
        </Switch>
      </HashRouter>
    </LocaleProvider>
  </Layout.Boundary>,
  document.getElementById('main')
)
