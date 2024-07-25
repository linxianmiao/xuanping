import React, { Component } from 'react'
import { Row, Col } from '@uyun/components'
import Header from './header'
import TicketTrend from './ticketTrend'
import PendingDistributed from './pendingDistributed'
import TicketCount from './ticketCount'
import AllDistributed from './allDistributed'
import ErrorBoundary from '~/components/ErrorBoundary'

import './style/index.less'

import HeaderStore from './store/headerStore'
import TicketTrendStore from './store/ticketTrendStore'
import PendingDistributedStore from './store/pendingDistributedStore'
import TicketCountStore from './store/ticketCountStore'
import AllDistributedStore from './store/allDistributedStore'

const headerStore = new HeaderStore()
const ticketTrendStore = new TicketTrendStore()
const pendingDistributedStore = new PendingDistributedStore()
const ticketCountStore = new TicketCountStore()
const allDistributedStore = new AllDistributedStore()

class Index extends Component {
  render() {
    return (
      <div className="overview-default">
        <Header headerStore={headerStore} />
        <Row style={{ marginBottom: 20 }}>
          <Col span={18}>
            <ErrorBoundary desc={i18n('ticketTrendFail', '工单趋势加载失败')}>
              <TicketTrend ticketTrendStore={ticketTrendStore} />
            </ErrorBoundary>
          </Col>
          <Col span={6}>
            <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
              <PendingDistributed
                store={pendingDistributedStore}
                globalStore={this.props.globalStore}
              />
            </ErrorBoundary>
          </Col>
        </Row>
        <Row style={{ marginBottom: 20 }}>
          <Col span={18}>
            <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
              <TicketCount store={ticketCountStore} />
            </ErrorBoundary>
          </Col>
          <Col span={6}>
            <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
              <AllDistributed store={allDistributedStore} />
            </ErrorBoundary>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Index
