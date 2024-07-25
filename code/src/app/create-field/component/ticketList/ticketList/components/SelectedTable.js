import React, { Component, Fragment } from 'react'
import { Table, Button } from '@uyun/components'
import { observer } from 'mobx-react'

@observer
export default class SelectTable extends Component {
  render () {
    const { ticketListStore, disabled } = this.props
    const { selectedList, toggleListModalVisible, removeItem } = ticketListStore

    const columns = [
      {
        title: '关联单号',
        dataIndex: 'ticketNum',
        key: 'ticketNum'
      },
      {
        title: '工单标题',
        dataIndex: 'ticketName',
        key: 'ticketName'
      },
      {
        title: '关联描述',
        dataIndex: 'ticketDesc',
        key: 'ticketDesc'
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        width: 100,
        render: (text, record) => {
          return <a onClick={() => { removeItem(record) }}>移除</a>
        }
      }
    ]
    if (disabled) {
      columns.pop()
    }
    return <Fragment>
      <Table
        rowKey={'ticketId'}
        columns={columns}
        pagination={false}
        bordered
        childrenColumnName={'zxcxvsdf'}
        dataSource={selectedList}
      />
      {disabled ? null : <div className="operate">
        <Button className="relate-btn" onClick={toggleListModalVisible} type={'primary'}>关联已有工单</Button>
      </div>}

    </Fragment>
  }
}
