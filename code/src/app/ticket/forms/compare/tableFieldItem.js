import React, { Component } from 'react'
import { Table } from '@uyun/components'

class TableFiledItem extends Component {
  render () {
    const { fields, data } = this.props
    var columns = []
    const width = 100 / fields.length + '%'
    _.map(fields, field => {
      columns.push({
        width: width,
        title: field.name,
        dataIndex: field.code,
        key: field.code
      })
    })
    return (
      <div className="control-table">
        <Table rowKey={record => record.id} pagination={false} columns={columns} dataSource={data} />
      </div>
    )
  }
}

export default TableFiledItem
