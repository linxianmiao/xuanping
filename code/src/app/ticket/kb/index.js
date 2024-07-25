import React, { Component } from 'react'
import { Modal, message, Drawer } from '@uyun/components'
import './style/index.less'

const titles = {
  search: i18n('ticket.kb.search', '搜索知识'),
  create: i18n('ticket.kb.create', '工单转知识'),
  detail: i18n('ticket.kb.detail', '查看知识')
}

class KbModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      height: 0,
      visible: false,
      src: ''
    }
  }

    closeModal = () => {
      const type = this.props.type
      if (type !== 'create') {
        this.props.onClose()
      }
      if (type === 'create' && !this.state.visible) {
        this.setState({ visible: true })
        Modal.confirm({
          content: i18n('ticket.kb.exit_tips', '知识未保存，您确认退出吗？'),
          onOk: this.onOk,
          onCancel: this.onCancel
        })
      }
    }

    onOk = () => {
      this.props.onClose()
      this.setState({ visible: false })
    }

    onCancel = () => {
      setTimeout(() => {
        this.setState({ visible: false })
      }, 500)
    }

    componentWillReceiveProps (nextProps) {
      const height = document.documentElement.clientHeight
      this.setState({ height: height - 92 })
      setTimeout(() => {
        this.setState({ src: nextProps.src })
      }, 300)
      if (nextProps.visible) {
        window.addEventListener('message', this.handleResponse)
      } else {
        window.removeEventListener('message', this.handleResponse)
      }
    }

    handlePostMessage = () => {
      const wd = document.getElementById('iframe')
      const data = this.props.data ? {
        origin: 'itsm',
        data: this.props.data
      } : {}
      wd && wd.contentWindow.postMessage(data, '*')
    }

    handleResponse = res => {
      const { code, exception } = res.data
      if (code === 2) {
        this.handlePostMessage()
      } else if (code === 0) {
        message.success(i18n('ticket.kb.success', '创建成功！'))
        this.props.onClose(true)
      } else {
        message.error(exception)
      }
    }

    render () {
      const { visible, type } = this.props
      const { src } = this.state

      return (
        <Drawer
          title={titles[type]}
          onClose={this.closeModal}
          visible={visible}>
          <iframe
            id="iframe"
            src={src}
            scrolling="yes"
            style={{ width: '100%', height: this.state.height }}
            frameBorder={0} />
        </Drawer>
      )
    }
}

export default KbModal
