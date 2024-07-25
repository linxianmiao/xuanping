import React, { Component } from 'react'
import { Table, Collapse, Modal, Title } from '@uyun/components'
class RelateTicket extends Component {
  state = {
    activeKey: '1'
  }

  columns = [
    {
      title: i18n('ticket.relateTicket.title', '标题'),
      dataIndex: 'title'
    },
    {
      title: i18n('ticket.relateTicket.type', '关系类型'),
      dataIndex: 'ticketRelationType'
    },
    {
      title: i18n('ticket.relateTicket.modelName', '流程类型'),
      dataIndex: 'modelName'
    },
    {
      title: i18n('ticket.relateTicket.activity', '流程环节'),
      dataIndex: 'activityName'
    },
    {
      title: i18n('ticket.relateTicket.status', '流程状态'),
      dataIndex: 'status'
    },
    {
      title: i18n('ticket.relateTicket.handle', '处理组/人'),
      dataIndex: 'user'
    },
    {
      title: i18n('operation', '操作')
    }
  ]

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

  getExtra = () => {
    return this.props.disabled ? null : (
      <i onClick={this.handleDel} className="iconfont icon-shanchu" />
    )
  }

  render() {
    const { name, isRequired } = this.props.formLayout
    const { activeKey } = this.state
    return (
      <Collapse
        activeKey={activeKey}
        onChange={() => {
          this.setState((prevState) => {
            return {
              activeKey: prevState.activeKey === '1' ? '0' : '1'
            }
          })
        }}
        className="no-border-collapse"
      >
        <Collapse.Card
          key="1"
          header={
            <span onClick={this.handleSideShow}>
              {isRequired === 1 ? <span className="required-item-icon">*</span> : null}
              {name}
            </span>
          }
          extra={this.getExtra()}
        >
          <Table columns={this.columns} dataSource={[]} pagination={false} />
        </Collapse.Card>
      </Collapse>
    )
  }
}

export default RelateTicket
