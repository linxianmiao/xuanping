import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Title } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import PieChart from './pieChart'
import PendingTable from './pendingTable'

import './style/table.less'

@inject('pendingChartStore')
@observer
class Pending extends Component {
  state = {
    total: undefined
  }

  componentDidMount() {
    this.props.pendingChartStore.getPendingChart()
    window.changeSkin_hook_pending = () => {
      const skin = document.querySelector('html').classList.contains('blue') ? 'blue' : 'white'
      this.props.pendingChartStore.setSkin(skin)
    }
  }

  componentWillUnmount() {
    window.changeSkin_hook_pending = () => {}
  }

  render() {
    const { total } = this.state
    return (
      <div className="overview-person-ticket-wrap">
        <Title
          extra={
            <Link className="check-more" to="/ticket/myToDo">
              {i18n('more', '查看更多')}
            </Link>
          }
        >
          <span>
            {i18n('pending_ticket', '我的待处理工单')}({total})
          </span>
        </Title>
        <Row className="overview-person-ticket-content">
          <Col className="overview-person-ticket-chart" span={8}>
            {total && <PieChart total={total} store={this.props.pendingChartStore} />}
            <p className="overview-person-ticket-chart-title">
              {i18n('model.distribution', '模型分布')}
            </p>
          </Col>
          <Col className="overview-person-ticket-table" span={16}>
            <PendingTable onChange={(total) => this.setState({ total })} />
          </Col>
        </Row>
      </div>
    )
  }
}

export default Pending
