import React from 'react'
import { Table } from '@uyun/components'
import moment from 'moment'

import { getStatus } from './logic'

import styles from './index.module.less'

function TableList({ dataSource, pagination, loading, onChange, handleTitle }) {
  const columns = [
    {
      title: '标题',
      dataIndex: 'ticketName',
      width: 240,
      render: (title, record) => <a onClick={() => handleTitle(record)}>{title}</a>
    },
    {
      title: '流水号',
      dataIndex: 'ticketNum',
      width: 200
    },
    {
      title: '类型',
      dataIndex: 'processName',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 150,
      render: text => {
        const { name, color } = getStatus(text)
        return (
          <span className={styles.ticketStatus}>
            <i style={{ background: color }} />
            {name}
          </span>
        )
      }
    },
    {
      title: '当前阶段',
      dataIndex: 'tacheName',
      width: 150
    },
    {
      title: '处理人/处理组',
      width: 190,
      render: record => {
        const { excutors, executionGroup } = record
        const excutorsStr = excutors.join(',')
        const executionGroupStr = executionGroup.join(',')
        return (
          <>
            <span className={styles.executorColSpan}>{excutorsStr}</span>
            {!!excutorsStr && !!executionGroupStr && (
              <span style={{ display: 'inline-block', verticalAlign: 'top' }}>/</span>
            )}
            <span className={styles.executorColSpan}>{executionGroupStr}</span>
          </>
        )
      }
    },
    {
      title: '创建人',
      width: 150,
      dataIndex: 'creatorName'
    },
    {
      title: '创建时间',
      dataIndex: 'creatorTime',
      width: 200,
      sorter: true,
      render: text =>
        moment(text)
          .utc(moment(text))
          .format('YYYY-MM-DD HH:mm')
    }
  ]
  return (
    <Table
      owKey={record => {
        const { ticketId, tacheId, caseId } = record
        return ticketId + tacheId + caseId
      }}
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      pagination={pagination}
      onChange={onChange}
      scroll={{ x: 800 }}
    />
  )
}

TableList.defaultProps = {
  dataSource: [],
  pagination: {},
  loading: false,
  onChange: () => {},
  handleTitle: () => {}
}

export default TableList
