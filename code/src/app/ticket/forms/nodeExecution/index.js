import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import classnames from 'classnames'
import { Modal, Button, Spin } from '@uyun/components'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'

class NodeExecution extends Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
    this.state = {
      visible: false,
      isEdited: false, // 是否编辑
      loading: true
    }
  }

  handleEdit = () => {
    window.addEventListener('message', this.autoPostMessage)
    this.setState({ visible: true })
  }

  onCancel = () => {
    window.removeEventListener('message', this.autoPostMessage)
    this.setState({ visible: false })
  }

  autoPostMessage = (e) => {
    const { field, initialValue } = this.props
    // 数据传输成功
    if (e.data.type === 'auto.exec.target' && e.data.data) {
      this.props.setFieldsValue({
        [field.code]: e.data.data
      })
      this.onCancel()
      this.setState({ isEdited: true })
    }
    // 与auto通信建立完成
    if (e.data.type === 'auto.exec.target.loaded') {
      this.setState({ loading: false })
      if (initialValue) {
        const id = findDOMNode(this.ref.current)
        id.contentWindow.postMessage(
          { type: 'itsm.exec.target', action: 'set', value: initialValue },
          window.location.origin
        )
      }
    }
  }

  handleOk = () => {
    const id = findDOMNode(this.ref.current)
    id.contentWindow.postMessage(
      { type: 'itsm.exec.target', action: 'get' },
      window.location.origin
    )
  }

  render() {
    const {
      field,
      getFieldDecorator,
      disabled,
      initialValue,
      fieldMinCol,
      secrecy,
      formLayoutType
    } = this.props
    const { visible, isEdited } = this.state
    // 执行方式 0：节点选择 1：分组执行 2：监管代理
    const type = field.executeWay === 0 ? 'host' : field.executeWay === 1 ? 'group' : 'proxy'
    const style =
      field.executeWay === 0 || field.executeWay === 1
        ? {
            ModalWidth: '1000px',
            iframeHeight: '800px'
          }
        : {
            ModalWidth: '600px',
            iframeHeight: '280px'
          }
    const autoUrl = `/automation/#/iframe/exec_target?type=${type}&status=${
      disabled ? 'info' : 'edit'
    }`
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: initialValue || undefined,
          rules: [
            {
              required: +field.isRequired === 1
            }
          ]
        })(
          secrecy ? (
            <Secrecy />
          ) : (
            <Button onClick={this.handleEdit}>
              {isEdited || initialValue ? '已修改' : '未修改'}
            </Button>
          )
        )}
        <Modal
          title={i18n('edit', '编辑')}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.onCancel}
          width={style.ModalWidth}
        >
          <Spin spinning={this.state.loading}>
            <iframe
              width="100%"
              src={autoUrl}
              ref={this.ref}
              scrolling="yes"
              frameBorder={0}
              height={style.iframeHeight}
            />
          </Spin>
        </Modal>
      </FormItem>
    )
  }
}
export default NodeExecution
