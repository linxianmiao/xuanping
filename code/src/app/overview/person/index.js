import React, { Component } from 'react'
import { Provider, inject } from 'mobx-react'
import Header from './header'
import Refresh from './refresh'
import HeaderStore from './store/headerStore'
import PendingChartStore from './store/pendingChartStore'
import PendingTableStore from './store/pendingTableStore'
import CreatedChartStore from './store/createdChartStore'
import CreatedTableStore from './store/createdTableStore'
import ErrorBoundary from '~/components/ErrorBoundary'
import './style/index.less'
import Pending from './pending'
import Created from './created'

const headerStore = new HeaderStore()
const pendingChartStore = new PendingChartStore()
const pendingTableStore = new PendingTableStore()
const createdChartStore = new CreatedChartStore()
const createdTableStore = new CreatedTableStore()

@inject('globalStore')
class Person extends Component {
  onRefresh = () => {
    headerStore.getOverdueCount()
    pendingChartStore.getPendingChart()
    pendingTableStore.getTicketList()
    createdChartStore.getCreatedChart()
    createdTableStore.getAllTicket()
    // 同时刷新左侧菜单栏的工单数量
    this.props.globalStore.getFilterType()
  }

  render() {
    return (
      <Provider
        pendingChartStore={pendingChartStore}
        pendingTableStore={pendingTableStore}
        createdChartStore={createdChartStore}
        createdTableStore={createdTableStore}
      >
        <div className="overview-person">
          <Refresh onRefresh={this.onRefresh} />
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <Header store={headerStore} />
          </ErrorBoundary>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <Pending />
          </ErrorBoundary>
          <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
            <Created />
          </ErrorBoundary>
        </div>
      </Provider>
    )
  }
}

export default Person
