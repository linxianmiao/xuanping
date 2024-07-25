import React, { Component } from 'react'
import { Collapse, Modal } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import Layout from './layout'
const Panel = Collapse.Panel

@inject('formSetGridStore')
@observer
class SubForm extends Component {
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
    const { name, mode, relatedTemplateId } = this.props.formLayout
    const { simpleTemplates } = this.props.formSetGridStore
    const { activeKey } = this.state
    const currentSubForm = _.find(simpleTemplates, (item) => item.id === relatedTemplateId) || {}
    const { formLayoutVos } = currentSubForm
    return (
      <Collapse activeKey={activeKey} onChange={this.handleClick}>
        <Collapse.Card
          header={<span onClick={this.handleSideShow}>{name}</span>}
          extra={this.getExtra()}
          key="1"
        >
          {mode === 0 && formLayoutVos ? (
            _.map(formLayoutVos, (formLayout) => {
              return (
                <div key={formLayout.id} className="layout-template">
                  <div className="layout-template-mask" />
                  <Layout disabled formLayout={formLayout} />
                </div>
              )
            })
          ) : (
            <div />
          )}
        </Collapse.Card>
      </Collapse>
    )
  }
}

export default SubForm
