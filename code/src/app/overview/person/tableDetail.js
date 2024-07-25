import React, { Component } from 'react'
import { Table, Tooltip, Progress } from '@uyun/components'
import { Link } from 'react-router-dom'
import { msToTime } from '~/ticket-list/others/component/common/util'

class TableDetail extends Component {
  render() {
    const { current, total, pageSize, loading, data } = this.props
    const columns = [
      {
        title: i18n('tip17', '工单标题'),
        dataIndex: 'ticketName',
        width: 150,
        render: (text, row) => {
          return (
            <Tooltip
              placement="topLeft"
              title={<span className="person-table-title-tips">{row.ticketName}</span>}
            >
              <Link
                className="person-table-item person-table-title"
                to={{
                  pathname: `/ticket/detail/${row.ticketId}`,
                  query: {
                    tacheId: row.tacheId,
                    caseId: row.caseId,
                    tacheNo: row.tacheNo,
                    tacheType: row.tacheType
                  },
                  state: {
                    from: location.hash,
                    title: row.ticketName
                  }
                }}
              >
                {row.ticketName}
              </Link>
            </Tooltip>
          )
        }
      },
      {
        title: i18n('tip18', '流水号'),
        dataIndex: 'ticketNum',
        width: 150
      },
      {
        title: i18n('tip19', '工单模型'),
        dataIndex: 'processName',
        width: 100,
        render: (text, row) => {
          return <span className="person-table-item">{row.processName}</span>
        }
      },
      {
        title: i18n('tip20', '创建人'),
        dataIndex: 'creatorName',
        width: 100
      },
      {
        title: i18n('tip23', '工单状态'),
        width: 100,
        render: (text, row) => {
          const statusObj = {
            1: i18n('status_1', '待处理'),
            2: i18n('status_2', '处理中'),
            3: i18n('status_3', '已完成'),
            7: i18n('status_7', '已关闭'),
            10: i18n('status_10', '挂起'),
            11: i18n('status_11', '已废除')
          }
          const data = statusObj[row.status]
          return (
            <div className="person-table-item" style={{ maxWidth: '100px' }}>
              {data}
            </div>
          )
        }
      },
      {
        title: i18n('tip24', '当前阶段'),
        width: 100,
        render: (text, row) => {
          return <span className="person-table-item">{row.tacheName}</span>
        }
      },
      {
        title: i18n('tip25', '处理人'),
        width: 100,
        render: (text, row) => {
          return (
            <Tooltip
              placement="topLeft"
              title={<div className="huanhang">{row.excutors.join(', ')}</div>}
            >
              <div className="person-table-item">{row.excutors.join(',')}</div>
            </Tooltip>
          )
        }
      },
      {
        title: 'SLA',
        width: 100,
        dataIndex: 'overdueTime',
        render: (text, row) => {
          let overdueTime = ''
          if (row.overdueTimeUnit === 'DAYS') {
            overdueTime = text + i18n('ticket.list.day', '天')
          } else {
            overdueTime = msToTime(text)
          }
          return row.strategyId ? (
            <Tooltip
              placement="topLeft"
              title={
                row.overdue === 'true'
                  ? i18n('overdue', '已逾期：') + overdueTime
                  : i18n('residue', '即将逾期：') + overdueTime
              }
            >
              <Progress
                className="process-style"
                type="circle"
                percent={row.percent}
                width={28}
                showInfo={false}
                strokeWidth={15}
                status="exception"
              />
            </Tooltip>
          ) : (
            <div className="pro" />
          )
        }
      }
    ]
    const pagination = {
      showQuickJumper: true,
      showSizeChanger: true,
      size: 'small',
      pageSize: pageSize,
      current: current,
      total: total,
      onChange: (page, pageSize) => {
        this.props.onChange(page, pageSize)
      },
      onShowSizeChange: (page, pageSize) => {
        this.props.onChange(page, pageSize)
      }
    }
    return (
      <Table
        rowKey={(row) => row.rowId}
        columns={columns}
        loading={loading}
        scroll={{ y: 220 }}
        dataSource={data}
        pagination={pagination}
      />
    )
  }
}

export default TableDetail
