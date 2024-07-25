import React, { Component } from 'react'
import { Tooltip } from '@uyun/components'
import { getTicketSource } from './common/util'
import SLA from './sla'

class IconTd extends Component {
    getSLADOM = record => {
      return (<SLA record={record} type="circle" />)
    }

    // 子流程icon
    createSubProcess (record) {
      return (
        <Tooltip placement="topLeft" title={i18n('ticket.list.SubProcess', '子流程')}>
          <div style={{ cursor: 'pointer', marginTop: '3px', width: '14px', height: '14px' }}>
            <i className="iconfont icon-ziliucheng" />
          </div>
        </Tooltip>
      )
    }

    // 工单来源icon
    createSource (record) {
      return (
        <Tooltip placement="topLeft" title={getTicketSource(record.source)}>
          <div style={{ cursor: 'pointer', marginTop: '3px', width: '14px', height: '14px' }}>
            <i className={`${record.source} iconfont btn-available`} />
          </div>
        </Tooltip>
      )
    }

    render () {
      const { record } = this.props
      return (
        <div>
          { record.strategyId && this.getSLADOM(record) }
          { record.subTicket === 1 && this.createSubProcess(record) }
          {(record.source !== 'web') && this.createSource(record)}
        </div>
      )
    }
}

export default IconTd
