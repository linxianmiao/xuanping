/**
 * 更多操作菜单列表
 * @param {function} onClick 点击回调事件
 */
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Menu } from '@uyun/components'

class Item extends Component {
  render() {
    const { icon, name } = this.props
    return (
      <a data-id="preview" onClick={this.props.onClick} href="javascript:void(0);">
        <i style={{ paddingRight: 5 }} className={`iconfont ${icon}`} />
        <span>{ name }</span>
      </a>
    )
  }
}
@withRouter
export default class MenuList extends Component {
  render () {
    /**
     *   0    没有任何权限
     *   1    搜索知识
     *   2    查看知识   (具有搜索权限)
     *   3    工单转知识（具有搜索权限）
     */
    const { kb, isCopy } = this.props
    return (
      <Menu>
        {isCopy && <Menu.Item><Item onClick={() => { this.props.onClick('copy') }} icon="icon-fuzhi" name={i18n('ticket.copy', '复制工单')} /></Menu.Item>}
        {<Menu.Item><Item onClick={() => { this.props.onClick('search') }} icon="icon-sousuo" name={i18n('ticket.kb.search', '搜索知识')} /></Menu.Item>}
        { <Menu.Item><Item onClick={() => { this.props.onClick('detail') }} icon="icon-zhishiku" name={i18n('ticket.kb.detail', '查看知识')} /></Menu.Item>}
        {kb === 3 && <Menu.Item><Item onClick={() => { this.props.onClick('create') }} icon="icon-zhishiku" name={i18n('ticket.kb.create', '工单转知识')} /></Menu.Item>}
      </Menu>
    )
  }
}
