import React, { Component } from 'react'
import { Table } from '@uyun/components'

class UserTable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedRowKeys: []
    }
  }

    onSelectChange = selectedRowKeys => {
      this.setState({ selectedRowKeys })
      this.props.onChange(selectedRowKeys)
    }

    render () {
      const { count, list } = this.props.data
      const { selectedRowKeys } = this.state

      const rowSelection = {
        selectedRowKeys,
        onChange: this.onSelectChange
      }
      const pagination = {
        total: count,
        current: this.props.current,
        showQuickJumper: true,
        showTotal: () => {
          return i18n('total', '共') + count + i18n('item', '条')
        },
        onChange: current => {
          this.props.changePage(current)
        }
      }
      const columns = [{
        title: i18n('real_name', '姓名'),
        dataIndex: 'userName'
      }, {
        title: i18n('user_mail', '邮箱'),
        dataIndex: 'userEmail'
      }, {
        title: i18n('operation', '操作'),
        dataIndex: 'operation',
        className: 'uy-table-td-href',
        width: 200,
        render: (data, row) => {
          return <a className="href-btn warning" href="javascript:void(0);" onClick={() => { this.props.onDelete(row.userId) }}>
            {i18n('remove', '移除')}
          </a>
        }
      }]
      return (
        <Table
          className="user-table"
          loading={this.props.loading}
          rowKey="userId"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={list}
          pagination={count > 10 ? pagination : false}
        />
      )
    }
}

export default UserTable
