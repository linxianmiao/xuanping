import React, { Component } from 'react'
import { Table, Drawer } from '@uyun/components'

export default class ModalTable extends Component {
  onClose = () => {
    this.props.handleChangeVisible('')
  }

  render() {
    const { dataSource } = this.props
    const columns = [
      {
        title: i18n('model_name', '模型名称'),
        dataIndex: 'modelName'
      },
      {
        title: i18n('ticket-list-table-th-tacheName', '当前节点'),
        dataIndex: 'tacheName'
      },
      {
        title: i18n('ticket-list-table-th-tacheName', '当前节点'),
        dataIndex: 'type'
      }
    ]
    return (
      <Drawer title="关联模型" visible={!_.isEmpty(dataSource)} onClose={this.onClose}>
        <Table columns={columns} dataSource={dataSource} />
      </Drawer>
    )
  }
}
