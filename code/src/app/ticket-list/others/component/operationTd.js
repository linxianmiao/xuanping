import React, { Component } from 'react'
import { Dropdown, Menu } from '@uyun/components'

class OperationTd extends Component {
  render () {
    const { record } = this.props
    const menu = (
      <Menu onClick={e => { this.props.handleClick(record, e) }}>
        <Menu.Item key="acction">
          {record.isAttention ? i18n('ticket.list.attentioned', '已关注') : i18n('ticket.list.attention', '关注')}
        </Menu.Item>
        <Menu.Item
          key="order"
          disabled={!!(record.isExecutor === 0 || record.status !== 1)}
        >
          {record.status === 1 ? i18n('ticket.list.order', '接单') : i18n('ticket.list.receivedOrder', '已接单')}
        </Menu.Item>
        {
          (record.canRemind === 1 || record.canRemind === 0) &&
          <Menu.Item
            key="reminder"
            disabled={record.canRemind === 0}
          >
            {record.canRemind === 1 ? i18n('ticket.list.reminder', '催办') : i18n('ticket.list.hasReminder', '已催办')}
          </Menu.Item>
        }
      </Menu>
    )
    return (
      <div>
        <Dropdown overlay={menu}>
          <i className="iconfont icon-gengduocaozuo" style={{ cursor: 'pointer' }} />
        </Dropdown>
      </div>
    )
  }
}

export default OperationTd
