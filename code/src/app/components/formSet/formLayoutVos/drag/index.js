import React, { Component } from 'react'
import { Menu, Modal } from '@uyun/components'
import { inject, observer } from 'mobx-react'
import Field from './field'
import TicketFields from './ticketField'
import Layout from './layout'
import Control from './control'
import Script from './script'
import './index.less'

@inject('formSetGridStore', 'globalStore')
@observer
class Drag extends Component {
  script = React.createRef()

  state = {
    visible: false,
    selectedKeys: ['field']
  }

  componentDidMount() {
    this.props.formSetGridStore.setData([], 'simpleTemplates')
    this.props.formSetGridStore.getSourceList()
  }

  handleChangeMenu = (e) => {
    if (e.key === 'script') {
      this.handleChangeVisible(true)
    } else {
      this.setState({ selectedKeys: e.keyPath })
    }
  }

  handleOk = () => {
    this.script.current.validateScript((error, values) => {
      if (error) return false
      const { currentGrid } = this.props.formSetGridStore
      this.props.formSetGridStore.setData(_.assign({}, currentGrid, values), 'currentGrid')
      this.handleChangeVisible(false)
    })
  }

  handleChangeVisible = (visible) => {
    this.setState({ visible })
  }

  render() {
    const { currentGrid, type } = this.props.formSetGridStore
    const { combineCustomScript } = currentGrid
    const { selectedKeys, visible } = this.state
    const currentKey = selectedKeys[0]
    return (
      <div className="form-set-formLayoutVos-drag">
        <div className="menu-select">
          <Menu
            onClick={this.handleChangeMenu}
            selectedKeys={selectedKeys}
            style={{ height: '100%' }}
          >
            <Menu.Item key="field">工单</Menu.Item>
            <Menu.Item key="ticketfield" className="ticketField">
              流程
            </Menu.Item>
            <Menu.Item key="layout">{i18n('model.field.edit.left.group', '布局')}</Menu.Item>
            <Menu.Item key="control">{i18n('model.field.edit.left.frame', '控件')}</Menu.Item>
            <Menu.Item key="script">{i18n('model.field.edit.left.customScript', '脚本')}</Menu.Item>
          </Menu>
        </div>

        <div id="formset-field-wrap" className="right">
          {currentKey === 'field' && <Field />}
          {currentKey === 'layout' && <Layout />}
          {currentKey === 'control' && <Control type={type} />}
          {currentKey === 'ticketfield' && <TicketFields />}
        </div>
        <Modal
          destroyOnClose
          visible={visible}
          onOk={this.handleOk}
          onCancel={() => {
            this.handleChangeVisible(false)
          }}
          title={i18n('model.field.edit.left.customScript', '脚本')}
        >
          <Script ref={this.script} combineCustomScript={combineCustomScript} />
        </Modal>
      </div>
    )
  }
}

export default Drag
