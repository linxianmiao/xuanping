import React, { Component } from 'react'
import { Collapse, Modal } from '@uyun/components'
const Panel = Collapse.Panel

export default class Iframe extends Component {
  state = {
    activeKey: '1'
  }

  getExtra = () => {
    return this.props.disabled ? null : (
      <i onClick={this.handleDel} className="iconfont icon-shanchu" />
    )
  }

  handleDel = (e) => {
    e.stopPropagation()
    const { layoutIndex, parentType } = this.props
    Modal.confirm({
      title: i18n('model.field.edit.right.del.iframe.tip', '确定要删除该控件？'),
      onOk: () => {
        this.props.handleSideShow(null, 'side')
        this.props.handleDelLayout(layoutIndex, undefined, undefined, parentType)
      }
    })
  }

  handleClick = () => {
    this.setState({
      activeKey: this.state.activeKey === '1' ? '0' : '1'
    })
  }

  handleSideShow = (e) => {
    e.stopPropagation()
    const { layoutIndex, tabsIndex, fieldIndex } = this.props
    this.props.handleSideShow({
      layoutIndex: layoutIndex,
      tabsIndex,
      fieldIndex,
      parentType: 'layout'
    })
  }

  render() {
    const { name, height = 500 } = this.props.formLayout
    const { activeKey } = this.state
    return (
      <Collapse activeKey={activeKey} onChange={this.handleClick}>
        <Collapse.Card
          header={<span onClick={this.handleSideShow}>{name}</span>}
          extra={this.getExtra()}
          key="1"
        >
          <div style={{ height: `${height}px` }} />
        </Collapse.Card>
      </Collapse>
    )
  }
}
