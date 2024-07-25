import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Table } from '@uyun/components'
import moment from 'moment'
@observer
export default class DataList extends Component {
  onSelectChange = (selectedRowKeys) => {
    this.props.userRoleStore.setData({ selectedRowKeys })
  }

  render() {
    const { dataTableList, dataTableQuery, selectedRowKeys } = this.props.userRoleStore
    const { list, total } = dataTableList || {}
    const { pageNo, pageSize } = dataTableQuery
    const rowSelection = {
      selectedRowKeys: selectedRowKeys,
      onChange: this.onSelectChange
    }
    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '类别',
        dataIndex: 'categoryName'
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm')
      }
    ]
    const pagination = {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: true,
      current: pageNo,
      pageSize: pageSize,
      total: total,
      onShowSizeChange: (current, pageSize) => {
        this.props.handleChangeDataTableQuery({ pageNo: 1, pageSize })
      },
      onChange: (current, pageSize) => {
        this.props.handleChangeDataTableQuery({ pageNo: current, pageSize })
      }
    }
    return (
      <Table
        rowKey={(record) => record.id}
        dataSource={list}
        columns={columns}
        rowSelection={rowSelection}
        pagination={pagination}
      />
    )
  }
}
