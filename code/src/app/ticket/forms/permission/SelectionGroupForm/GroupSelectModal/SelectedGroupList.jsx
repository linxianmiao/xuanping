import React, { Component } from 'react'
import { Table } from '@uyun/components'
import { getGroupId } from '../../logic'

export default class SelectedGroupList extends Component {
  list = this.props.checkedGroups

  getRowKey = record => {
    if (record.groupId) {
      return 'groupId'
    }
    if (record.applicationId) {
      return 'applicationId'
    }
    if (record.id) {
      return 'id'
    }
    return 'groupId'
  }

  render() {
    const { checkedGroups } = this.props

    const columns = [
      {
        title: '名称',
        dataIndex: 'name'
      },
      {
        title: '编码',
        dataIndex: 'code',
        width: 220
      },
      {
        title: '分类',
        width: 220
      }
    ]

    const rowSelection = {
      selectedRowKeys: checkedGroups.map(getGroupId),
      onChange: (keys, rows) => this.props.onCheckGroups(rows)
    }

    return (
      <Table
        // rowKey="groupId"
        // rowKey={this.getRowKey}
        rowKey="applicationId"
        columns={columns}
        dataSource={this.list}
        pagination={false}
        scroll={{ y: 400 }}
        rowSelection={rowSelection}
      />
    )
  }
}
