/**
 * 工单详情，更多操作组件
 */

import React, { Component } from 'react'
import { DownOutlined } from '@uyun/icons';
import { Dropdown, Menu, Icon } from '@uyun/components'
/**
   *   0    没有任何权限
   *   1    搜索知识
   *   2    查看知识   (具有搜索权限)
   *   3    工单转知识（具有搜索权限）
   */

const menuConfig = {
  copy: {
    icon: 'icon-fuzhi',
    name: i18n('ticket.copy', '复制工单')
  },
  print: {
    icon: 'icon-dayin',
    name: i18n('ticket.kb.print', '打印工单')
  },
  search: {
    icon: 'icon-sousuo',
    name: i18n('ticket.kb.search', '搜索知识')
  },
  detail: {
    icon: 'icon-zhishiku',
    name: i18n('ticket.kb.detail', '查看知识')
  },
  create: {
    icon: 'icon-zhishiku',
    name: i18n('ticket.kb.create', '工单转知识')
  }
}

class MoreOperations extends Component {
  state = {
    kb: 0
  }

  handleClick = type => {
    if (type === 'print') {
      this.props.onPrint()
    } else {
      this.props.onClick(type)
    }
  }

  renderItem = (type) => {
    return (
      <a onClick={() => this.handleClick(type)} data-id="preview">
        <i style={{ paddingRight: 5 }} className={`iconfont ${menuConfig[type].icon}`} />
        <span>{menuConfig[type].name}</span>
      </a>
    )
  }

  onVisibleChange = async visible => {
    if (visible) {
      if (this.props.operateType === 'createTicket' || this.props.operateType === 'createTicketAlert') {
        this.setState({
          kb: this.props.kb
        })
      } else {
        const kb = await this.props.ticketStore.isGenerateKB(this.props.ticketId)
        this.setState({
          kb
        })
      }
    }
  }

  render() {
    const { canPrint, isCanCopy } = this.props
    const { kb } = this.state
    const menu = (
      <Menu>
        {window.location.pathname.indexOf('/ticket.html') == -1 ?
          (isCanCopy === 1 ? <Menu.Item>{this.renderItem('copy')}</Menu.Item> : null)
          : null
        }
        {canPrint && <Menu.Item>{this.renderItem('print')}</Menu.Item>}
        {window.location.pathname.indexOf('/ticket.html') == -1 ?
          (Boolean(kb) && <Menu.Item>{this.renderItem('search')}</Menu.Item>)
          : null
        }
        {kb === 2 && <Menu.Item>{this.renderItem('detail')}</Menu.Item>}
        {kb === 3 && <Menu.Item>{this.renderItem('create')}</Menu.Item>}
      </Menu>
    )

    return (kb || canPrint || isCanCopy) ? (
      <Dropdown overlay={menu} onVisibleChange={this.onVisibleChange}>
        <span className="iconfont-wrap">
          {i18n('globe.more', '更多')}
          <DownOutlined style={{ marginLeft: 8 }} />
        </span>
      </Dropdown>
    ) : null;
  }
}

export default MoreOperations
