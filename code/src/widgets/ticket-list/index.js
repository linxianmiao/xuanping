import React, { Component } from 'react'
import { Provider } from 'mobx-react'
import { MemoryRouter } from 'react-router-dom'
import '~/common/common'
import 'moment/locale/zh-cn'
import globalStore from '../../app/stores/globalStore'
import modelListStore from '../../app/stores/modelListStore'
import userPickStore from '../../app/stores/userPickStore'
import '../../../public/static/fonts/iconfont.css'
import '../../../public/static/fonts/iconfont.js'
import './index.less'
import TabList from './tabs'

class TicketQueryList extends Component {
  static defaultProps = {
    filterType: [],
    appkey: ''
  }

  componentDidMount() {
    window.TICKET_QUERY = {}
  }

  render() {
    return (
      <div className="itsm-ticket-query-list">
        <Provider
          globalStore={globalStore}
          modelListStore={modelListStore}
          userPickStore={userPickStore}
        >
          <MemoryRouter>
            <TabList {...this.props} />
          </MemoryRouter>
        </Provider>
      </div>
    )
  }
}

export default TicketQueryList
