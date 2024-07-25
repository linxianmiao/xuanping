import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import { Table } from '@uyun/components'

@inject('fieldListShareStore')
@observer
class FieldList extends Component {
  componentDidMount () {
    this.props.fieldListShareStore.getFieldList()
  }

  getColumns = () => {
    return [
      {
        title: i18n('field_name', '字段名称'),
        dataIndex: 'name',
        render: (text, row) => <Link className="table-title" to={`/conf/field/update/${row.code}`}>{text}</Link>
      },
      {
        title: i18n('field_code', '编码'),
        dataIndex: 'code'
      },
      {
        title: i18n('field_type', '类型'),
        dataIndex: 'typeDesc'
      },
      {
        title: i18n('tip8', '来源'),
        dataIndex: 'sharedBusinessUnitName'
      }
    ]
  }

  handlePaginationChange = (current, pageSize) => {
    const { fieldListShareStore } = this.props

    fieldListShareStore.setProps({
      query: { ...fieldListShareStore.query, pageNo: current, pageSize }
    })
    fieldListShareStore.getFieldList()
  }

  render() {
    const { fieldListShareStore } = this.props
    const { loading, tableObj, query } = fieldListShareStore
    const { list, total } = tableObj
    const { pageNo, pageSize } = query || {}
    const pagination = {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: true,
      current: pageNo,
      pageSize,
      total,
      onShowSizeChange: (current, pageSize) => {
        this.handlePaginationChange(1, pageSize)
      },
      onChange: this.handlePaginationChange
    }

    return (
      <Table
        rowKey="id"
        loading={loading}
        columns={this.getColumns()}
        dataSource={list}
        pagination={pagination}
      />
    )
  }
}

export default FieldList