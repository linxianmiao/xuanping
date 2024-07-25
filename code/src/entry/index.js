import './system/map'
import '@uyun/runtime'
import '~/common/common'
import React from 'react'
import ReactDOM from 'react-dom'
import Layout from '@uyun/layout'
import App from './app'
import _ from 'lodash'
import moment from 'moment'
import 'moment/locale/zh-cn'
import locale from '@uyun/components/es/date-picker/locale/zh_CN'

window._ = _
window.moment = moment
window.TICKET_QUERY = {}

if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (event) => {
    if (event.message === 'ResizeObserver loop completed with undelivered notifications.') {
      document.getElementById('webpack-dev-server-client-overlay').style.display = 'none'
    }
  })
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
