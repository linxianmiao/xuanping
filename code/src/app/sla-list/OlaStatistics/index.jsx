import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Table } from '@uyun/components'
import Header from './Header'
import Status from '../components/Status'
import useTable from '~/hooks/useTable'
import { getOlaOverdueInfo } from '~/logic/olaAndSla'
import moment from 'moment'

const getList = async (params) => {
  const res = await axios.post(API.queryOlaPolicyList, params)
  return res
}

const getOlaTypeName = (type) => {
  switch (type) {
    case 0:
      return '工单响应'
    case 1:
      return '工单处理'
    case 2:
      return '节点总时长'
    default:
      return ''
  }
}

const getOlaStatusName = (status) => {
  switch (status) {
    case 0:
      return '待执行'
    case 1:
      return '执行中'
    case 2:
      return '已完成'
    default:
      return ''
  }
}

const OlaStatistics = ({ configAuthor }) => {
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const { tableProps, paginationProps, filterProps } = useTable(getList, {
    totalKey: 'total',
    dataKey: 'list',
    currentKey: 'pageNum',
    pageSizeKey: 'pageSize',
    needFiltersCache: true,
    filterCacheName: 'OLA_LIST_FILTERS'
  })

  const columns = [
    {
      title: i18n('ticket.list.ticketName', '工单标题'),
      dataIndex: 'title',
      render: (title, record) => (
        <Link
          to={{
            pathname: `/ticket/detail/${record.ticketId}`,
            state: {
              fromHase: '/conf/sla/olaStatistics',
              fromName: i18n('layout.sla_manage', 'SLA管理')
            }
          }}
        >
          {title}
        </Link>
      )
    },
    {
      title: '工单号',
      dataIndex: 'flowNo'
    },
    {
      title: i18n('sla_ticket_type', '工单类型'),
      dataIndex: 'modelName'
    },
    {
      title: i18n('ticket.list.tacheName', '当前节点'),
      dataIndex: 'activityName'
    },
    {
      title: 'OLA类型',
      dataIndex: 'olaType',
      render: getOlaTypeName
    },
    {
      title: 'OLA状态',
      dataIndex: 'olaStatus',
      render: getOlaStatusName
    },
    {
      title: '是否逾期',
      dataIndex: 'overdueStatus',
      render: (status) => <Status {...getOlaOverdueInfo(status)} />
    },
    {
      title: i18n('start.time', '开始时间'),
      dataIndex: 'actualStartTime',
      render: (time) => (time ? moment(time).format('YYYY/MM/DD HH:mm') : '')
    },
    {
      title: i18n('end.time', '结束时间'),
      dataIndex: 'actualEndTime',
      render: (time) => (time ? moment(time).format('YYYY/MM/DD HH:mm') : '')
    }
  ]

  const onDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await axios.get(API.deleteOLARecord, {
        params: { ids: selectedRowKeys.join(',') }
      })
      if (res) {
        filterProps.onSubmit()
        setSelectedRowKeys([])
      }
      setDeleteLoading(false)
    } catch (error) {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <Header
        {...filterProps}
        configAuthor={configAuthor}
        selectedRowKeys={selectedRowKeys}
        deleteLoading={deleteLoading}
        onDelete={onDelete}
        list={tableProps.dataSource}
      />
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys)
        }}
        rowKey="id"
        columns={columns}
        {...tableProps}
        pagination={paginationProps}
      />
    </>
  )
}

export default OlaStatistics
