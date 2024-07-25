import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { observer } from 'mobx-react'
import { Title, Card } from '@uyun/components'
import PieChart from './pieChart'

@withRouter
@observer
class PendingDistributed extends Component {
  componentDidMount() {
    this.props.store.getTicketChart(this.props.globalStore.priorityList || [])
    window.changeSkin_hook_pending_distributed = () => {
      const skin = document.querySelector('html').classList.contains('blue') ? 'blue' : 'white'
      this.props.store.setSkin(skin)
    }
  }

  onClick = (params) => {
    if (typeof params.data.priority !== 'undefined') {
      this.props.history.push({
        pathname: '/ticket/all',
        query: {
          priority: params.data.priority,
          status: '1_2'
        }
      })
    }
  }

  componentWillUnmount() {
    window.changeSkin_hook_pending_distributed = () => {}
  }

  render() {
    return (
      <div className="overview-default-public-wrap">
        <Title>{i18n('priority_statistics', '待处理工单优先级分布统计')}</Title>
        <Card bodyStyle={{ height: 360 }}>
          <PieChart store={this.props.store} onClick={this.onClick} />
        </Card>
      </div>
    )
  }
}

export default PendingDistributed
