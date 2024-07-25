import React, { Component } from 'react'
import { Table, Pagination, Tooltip } from '@uyun/components'
import { withRouter } from 'react-router-dom'
import { OperationTd, IconTd, PriorityTd, StatusTd } from './component'
import * as mobx from 'mobx'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import './style/table.less'

@withRouter
@observer
class TableList extends Component {
  static contextTypes = {
    filterUrl: PropTypes.string.isRequired
  }

  // tale列表
  getColumns = (e) => {
    const columns = [
      {
        title: i18n('ticket.list.ticketIcon', ' '),
        fixed: 'left',
        render: (text, record) => <IconTd text={text} record={record} />
      },
      {
        title: i18n('ticket.list.ticketName', '工单标题'),
        dataIndex: 'ticketName',
        fixed: 'left',
        render: (text, record) => {
          const ticket = {
            ticketId: record.ticketId,
            tacheType: record.tacheType || 0,
            tacheNo: record.tacheNo || 0
          }

          return (
            <div
              onClick={() => {
                this.props.history.push({
                  pathname: `/ticket/detail/${record.ticketId}`,
                  query: {
                    tacheType: record.tacheType || 0,
                    tacheNo: record.tacheNo || 0,
                    tacheId: record.tacheId,
                    modelId: record.processId,
                    caseId: record.caseId
                  }
                })
              }}
            >
              {text}
            </div>
          )
        }
      },
      {
        title: i18n('ticket.list.ticketNum', '流水号'),
        dataIndex: 'ticketNum'
      },
      {
        title: i18n('ticket.list.processName', '模型'),
        dataIndex: 'processName'
      },
      {
        title: i18n('ticket.list.tacheName', '当前节点'),
        dataIndex: 'tacheName'
      },
      {
        title: i18n('ticket.list.priority', '优先级'),
        dataIndex: 'priority',
        sorter: true,
        render: (text) => <PriorityTd priority={text} />
      },
      {
        title: i18n('ticket.list.status', '工单状态'),
        dataIndex: 'status',
        render: (text) => <StatusTd status={text} />
      },
      {
        title: i18n('ticket.list.creatorName', '创建人'),
        dataIndex: 'creatorName'
      },
      {
        title: i18n('ticket.list.excutors', '处理人'),
        dataIndex: 'excutors',
        className: 'ticket-list-td-excutors',
        render: (text) => {
          return (
            <Tooltip title={<div style={{ wordBreak: 'break-all' }}>{text.join(',')}</div>}>
              <div className="ticket-list-td-excutors-inner">{text.join(',')}</div>
            </Tooltip>
          )
        }
      },
      {
        title: i18n('ticket.list.creatorTime', '创建时间'),
        dataIndex: 'creatorTime',
        sorter: true
      },
      {
        title: i18n('ticket.list.operation', '操作'),
        key: 'operation',
        fixed: 'right',
        render: (text, record) => (
          <OperationTd text={text} record={record} handleClick={this.props.moreOpeartion} />
        )
      }
    ]
    return {
      columns
    }
  }

  // 改变页码
  handleChange = (page) => {
    this.props.ticketListStore.switchSceenData({ current: page })
  }

  // tableList排序
  handleSort(pagination, filters, sorter) {
    const sortData = {
      sortRule: sorter.order === 'ascend',
      orderBy: sorter.field === 'priority' ? 'urgent_level' : 'create_time'
    }
    this.props.ticketListStore.switchSceenData(sortData)
  }

  render() {
    const { columns } = this.getColumns()
    const { ticketList, ticketCount, screenData } = mobx.toJS(this.props.ticketListStore)
    return (
      <div className="table-list-wrap">
        <Table
          rowKey={(record) => record.ticketId + record.tacheId + record.caseId}
          dataSource={ticketList}
          columns={columns}
          onChange={(pagination, filters, sorter) => {
            this.handleSort(pagination, filters, sorter)
          }}
          pagination={false}
        />
        {ticketCount > screenData.pageSize && (
          <Pagination
            showQuickJumper
            pageSize={screenData.pageSize}
            current={screenData.current}
            total={ticketCount}
            onChange={this.handleChange}
          />
        )}
      </div>
    )
  }
}

export default TableList
