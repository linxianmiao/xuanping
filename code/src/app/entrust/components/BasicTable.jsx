import React from 'react'
import classnames from 'classnames'
import { Table } from '@uyun/components'

export default function BasicTable(props) {
  let columns = []
  if(props.currentTab!=='Entrust-force'){
    columns = [
      {
        title: '模型名称',
        dataIndex: 'modelName'
      },
      {
        title: '被委托人',
        dataIndex: 'consigneeName'
      },
      {
        title: '委托开始时间',
        dataIndex: 'beginTime'
      },
      {
        title: '委托结束时间',
        dataIndex: 'endTime'
      },
      {
        title: '委托状态',
        dataIndex: 'entrustStatusDesc',
        render: (text, record) => <span className={classnames('entrust-status-desc', {
          bg0: record.entrustStatus === 0,
          bg1: record.entrustStatus === 1,
          bg2: record.entrustStatus === 2
        })}> {text}</span>
      },
      {
        title: '审核状态',
        dataIndex: 'auditStatusDesc',
        render: (text, record) => <span className={classnames('audit-status-desc', {
          bg0: record.auditStatus === 0,
          bg1: record.auditStatus === 1,
          bg2: record.auditStatus === 2
        })} >{text}</span>
      },
      {
        title: '审核人',
        dataIndex: 'auditorName'
      },
      {
        title: ' 委托人',
        dataIndex: 'creatorName'
      },
      {
        title: '来源',
        dataIndex: 'source',
        render: (text) => text === 'web' ? '工单模型' : '服务目录'
      }
    ]
  } else {
    columns = [
      {
        title: '模型名称',
        dataIndex: 'modelName'
      },
      {
        title: '委托人',
        dataIndex: 'consignorName'
      },
      {
        title: '被委托人',
        dataIndex: 'consigneeName'
      },
      {
        title: '委托开始时间',
        dataIndex: 'beginTime'
      },
      {
        title: '委托结束时间',
        dataIndex: 'endTime'
      },
      {
        title: '委托状态',
        dataIndex: 'entrustStatusDesc',
        render: (text, record) => <span className={classnames('entrust-status-desc', {
          bg0: record.entrustStatus === 0,
          bg1: record.entrustStatus === 1,
          bg2: record.entrustStatus === 2
        })}> {text}</span>
      },
      {
        title: ' 操作人',
        dataIndex: 'creatorName'
      },
    ]
  }
  

  const { exColumns = [], ...rest } = props
  return (
    <Table
      {...rest}
      style={{ marginTop: 15 }}
      columns={[...columns, ...exColumns]}
    />
  )
}