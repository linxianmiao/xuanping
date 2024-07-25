import React from 'react'
import { withRouter } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import * as mobx from 'mobx'
import { Table } from '@uyun/components'
import { msToTime, msToTimeAll } from '../ticket-list/others/component/common/util'
import { renderUnit } from '../sla-list/common'
import './style/sla.less'

@inject('ticketStore')
@withRouter
@observer
class OLA extends React.Component {
  constructor() {
    super()
    this.columns = [
      {
        title: i18n('ticket.ola.activity', '所属阶段'),
        dataIndex: 'activityName',
        key: 'activityName'
      },
      {
        title: i18n('ticket.ola.type', 'OLA类型'),
        dataIndex: 'olaType',
        key: 'olaType',
        render: (text) => {
          switch (text) {
            case 0:
              return <div>{i18n('ticket.list.ola.response', '工单响应')}</div>
            case 1:
              return <div>{i18n('ticket.list.ola.handle', '工单处理')}</div>
            case 2:
              return <div>{i18n('ticket.list.ola.duration', '环节总时长')}</div>
          }
        }
      },
      {
        title: i18n('ticket.ola.overdueStatus', '状态'),
        dataIndex: 'overdueStatus',
        key: 'overdueStatus',
        render: (text) => {
          switch (text) {
            case 1:
              return (
                <div className="ola-status-normal">
                  {i18n('ticket.list.overdue.status0', '未逾期')}
                </div>
              )
            case 2:
              return (
                <div className="ola-status-overdue">
                  {i18n('ticket.list.overdue.status1', '已逾期')}
                </div>
              )
            case 3:
              return (
                <div className="ola-status-recover">
                  {i18n('ticket.list.overdue.status2', '逾期已恢复')}
                </div>
              )
            default:
              break
          }
        }
      },
      {
        title: i18n('ticket.ola.startTime', '开始计算时间'),
        dataIndex: 'startTime',
        key: 'startTime'
      },
      {
        title: i18n('ticket.ola.endTime', '结束计算时间'),
        dataIndex: 'endTime',
        key: 'endTime'
      },
      {
        title: i18n('ticket.ola.actualAgreedTime', '约定目标'),
        dataIndex: 'actualTime',
        key: 'actualTime',
        // render: (text, record) => `${text}${renderUnit(record.actualTimeUnit)}`
        render: (text, record) => {
          // return msToTimeAll(text)
          let txt = ''
          if (record.actualTimeUnit === 'DAYS') {
            txt = `${text}${renderUnit(record.actualTimeUnit)}`
          } else {
            txt = msToTime(text)
          }
          return txt
        }
      },
      {
        title: i18n('ticket.ola.consumeTime', '实际耗时'),
        dataIndex: 'consumeTime',
        key: 'consumeTime',
        render: (text, record) => {
          let txt = ''
          if (record.actualTimeUnit === 'DAYS') {
            txt = `${text}${renderUnit(record.actualTimeUnit)}`
          } else {
            txt = msToTime(text)
          }
          return txt
        }
      }
    ]
  }

  componentDidMount() {
    const { id, ticketStore, source } = this.props
    if (source !== 'formset') {
      ticketStore.getOLAList(id)
    }
  }

  render() {
    let OLAMessages = mobx.toJS(this.props.ticketStore.OLAList)
    const { fromDetail } = this.props
    fromDetail && (OLAMessages = OLAMessages.slice(0, 1))
    return (
      <div>
        <Table
          dataSource={OLAMessages}
          columns={this.columns}
          pagination={false}
          className="SLA_table"
          size="small"
        />
      </div>
    )
  }
}
export default OLA
