import React, { Component } from 'react'
import { Modal } from '@uyun/components'
import Editor from '~/ticket/mention/MentionWithOption'

export default class Operation extends Component {
  static defaultProps = {
    type: '', // accept:受理 reject:拒绝
    onOk: () => {}
  }

  state = {
    visible: false,
    message: ''
  }

  handleOk = () => {
    this.props.onOk(this.state.message)
    this.handleClose()
  }

  handleClose = () => {
    this.setState({ visible: false, message: '' })
  }

  getTitle = (type) => {
    switch (type) {
      case 'accept':
        return '受理'
      case 'reject':
        return '拒绝'
      default:
        return ''
    }
  }

  render() {
    const { type } = this.props
    const { visible, message } = this.state
    const title = this.getTitle(type)

    return (
      <>
        <a onClick={() => this.setState({ visible: true })}>{title}</a>

        <Modal
          title={title}
          visible={visible}
          destroyOnClose
          onOk={this.handleOk}
          onCancel={this.handleClose}
        >
          <Editor val={message} handleChange={(message) => this.setState({ message })} />
        </Modal>
      </>
    )
  }
}
