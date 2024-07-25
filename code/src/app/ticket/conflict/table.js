import React, { Component } from 'react'
import { Table } from '@uyun/components'
class ConflictTable extends Component {
  render () {
    const { dataSource, params } = this.props
    const columns = []
    !_.isEmpty(params) && params.map(item => {
      columns.push({
        title: item.label,
        dataIndex: item.value,
        key: item.value,
        width: 120
      })
    })
    return (
      <div>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ x: columns.length * 120 }}
        />
      </div>
    )
  }
}

export default ConflictTable
