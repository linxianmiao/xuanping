import React from 'react'
import { Table } from '@uyun/components'
import { getSLATime, msToTime, msToTimeAll } from '~/ticket-list/others/component/common/util'

import { renderUnit } from '~/sla-list/common'

const SlaTable = (props) => {
  const { data } = props

  const columns = [
    {
      title: i18n('ticket.sla.name', '目标SLA名称'),
      dataIndex: 'slaStrategyName',
      key: 'slaStrategyName'
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
        return msToTimeAll(text)
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

  return (
    <Table
      className="SLA_table"
      columns={columns}
      dataSource={data}
      pagination={false}
      size="small"
    />
  )
}

export default SlaTable
