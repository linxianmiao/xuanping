import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import * as mobx from 'mobx'
import { store as runtimeStore } from '@uyun/runtime-react'
import { Table } from '@uyun/components'
import { getSLATime, msToTime, msToTimeAll } from '../ticket-list/others/component/common/util'
import { renderUnit } from '../sla-list/common'
import './style/sla.less'

@inject('ticketStore')
@withRouter
@observer
class SLA extends React.Component {
  constructor() {
    super()
    this.columns = [
      {
        title: i18n('ticket.sla.name', '目标SLA名称'),
        dataIndex: 'slaStrategyName',
        key: 'slaStrategyName',
        render: (text, record) => {
          return (
            <React.Fragment>
              {window.location.pathname.indexOf('/ticket.html') === -1 ? (
                this.props.ticketSource !== 'portal' ? (
                  <a
                    onClick={() => {
                      this.headerClick(record)
                    }}
                  >
                    {text}
                  </a>
                ) : (
                  text
                )
              ) : (
                text
              )}
            </React.Fragment>
          )
        }
      },
      {
        title: i18n('ticket.sla.overdueStatus', '状态'),
        dataIndex: 'overdueStatus',
        key: 'overdueStatus',
        render: (text) => {
          switch (text) {
            case 0:
              return (
                <div className="sla-status-normal">
                  {i18n('ticket.list.overdue.status0', '未逾期')}
                </div>
              )
            case 1:
              return (
                <div className="sla-status-overdue">
                  {i18n('ticket.list.overdue.status1', '已逾期')}
                </div>
              )
            case 2:
              return (
                <div className="sla-status-recover">
                  {i18n('ticket.list.overdue.status2', '逾期已恢复')}
                </div>
              )
          }
        }
      },
      {
        title: i18n('ticket.sla.startTime', '开始计算时间'),
        dataIndex: 'startTime',
        key: 'startTime'
      },
      {
        title: i18n('ticket.sla.endTime', '结束计算时间'),
        dataIndex: 'endTime',
        key: 'endTime'
      },
      {
        title: i18n('ticket.sla.actualAgreedTime', '约定目标'),
        dataIndex: 'actualTime',
        key: 'actualTime',
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
        title: i18n('ticket.sla.consumeTime', '实际耗时'),
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
    const { id, ticketStore } = this.props

    ticketStore.getSLAList(id)
  }

  headerClick = (sla) => {
    if (runtimeStore.getState().user?.root) {
      // 管理员才行
      this.props.history.push(`/conf/sla/policy/detail/${sla.strategyId}`)
    }
  }

  render() {
    let SLAMessages = mobx.toJS(this.props.ticketStore.SLAList)
    const { fromDetail } = this.props
    fromDetail && (SLAMessages = SLAMessages.slice(0, 1))
    return (
      <div>
        <Table
          dataSource={SLAMessages}
          columns={this.columns}
          pagination={false}
          className="SLA_table"
          size="small"
        />
      </div>
    )
  }
}
export default SLA
