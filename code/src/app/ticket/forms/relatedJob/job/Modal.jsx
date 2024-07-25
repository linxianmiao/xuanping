import React, { Component } from 'react'
import { Modal } from '@uyun/components'
import Iframe from './Iframe'
import { getUrl, getPostMessageType } from './logic'

export default class JobModal extends Component {
  static defaultProps = {
    iframeType: '',
    id: '',
    ticketId: '',
    value: [],
    onOk: () => {},
    onClose: () => {}
  }

  state = {
    loading: false
  }

  componentDidUpdate(prevProps) {
    const { iframeType } = this.props

    // 弹窗打开时监听message
    if (iframeType !== prevProps.iframeType && this.iframeTypeList.includes(iframeType)) {
      window.addEventListener('message', this.message)
    }
  }

  // 弹窗支持的iframe动作类型
  iframeTypeList = ['plan-create', 'plan-edit', 'timer-create', 'timer-edit', 'timer-list']

  message = (e) => {
    this.setState({ loading: false })

    if (!e.data || !e.data.type) {
      return
    }

    const { data } = e.data
    const { iframeType, value } = this.props

    if (e.data.type === 'auto.rendered') {
      if (iframeType === 'timer-list') {
        setTimeout(() => {
          this.postMessage(getPostMessageType(iframeType, 1), value)
        }, 1000)
      }
      return
    }

    if (data?.error) {
      return
    }

    const list = value ? [...value] : []
    let nextList = []

    if (iframeType.indexOf('create') !== -1) {
      // 创建时需要给每条数据加status和actionType
      let status = -1 // -1无意义
      let actionType = 0 // 0无意义
      let jobId = data.jobId

      if (iframeType.indexOf('plan') !== -1) {
        status = 10
        actionType = 2
      } else if (iframeType.indexOf('timer') !== -1) {
        status = 0
        actionType = 1
        jobId = data.id
      }

      nextList = [{ ...data, status, actionType, jobId }, ...list]
    } else if (iframeType.indexOf('edit') !== -1) {
      nextList = list.map((item) => {
        const jobId = iframeType.indexOf('timer') !== -1 ? item.id : item.jobId
        return item.id === data.id ? { ...item, ...data, jobId } : item
      })
    } else {
      // 选择要停用的定时作业
      const timerList = data.data.map((item) => ({
        id: item.id,
        jobId: item.id,
        name: item.name,
        status: item.status,
        actionType: 3
      }))

      // auto页面中取消勾选的情况
      nextList = list
        .filter((item) => {
          if (item.actionType !== 3) {
            return true
          }
          return timerList.findIndex((timer) => timer.id === item.id) !== -1
        })
        .concat(timerList)

      nextList = _.uniqBy([...nextList, ...timerList], 'id')
    }

    this.props.onOk(nextList)
  }

  postMessage = (type, data) => {
    const { iframeType } = this.props
    const dom = document.getElementById(iframeType)
    dom.contentWindow.postMessage({ type, data }, '*')
  }

  handleOk = () => {
    this.setState({ loading: true }, () => {
      const { iframeType } = this.props
      this.postMessage(getPostMessageType(iframeType))
    })
  }

  handleAfterClose = () => {
    window.removeEventListener('message', this.message)
  }

  getTitle = (iframeType) => {
    switch (iframeType) {
      case 'plan-create':
        return '创建执行计划'
      case 'plan-edit':
        return '编辑执行计划'
      case 'timer-create':
        return '创建定时作业'
      case 'timer-edit':
        return '编辑定时作业'
      case 'timer-list':
        return '选择定时作业'
      default:
        return ''
    }
  }

  render() {
    const { iframeType, id, ticketId, onClose, modelId, modelCode } = this.props
    const { loading } = this.state

    return (
      <Modal
        visible={this.iframeTypeList.includes(iframeType)}
        title={this.getTitle(iframeType)}
        width="75%"
        bodyStyle={{
          height: 600,
          paddingLeft: 0,
          paddingRight: 0,
          overflow: 'hidden'
        }}
        okButtonProps={{ loading }}
        destroyOnClose
        afterClose={this.handleAfterClose}
        onOk={this.handleOk}
        onCancel={() => {
          this.setState({ loading: false })
          onClose()
        }}
      >
        <Iframe id={iframeType} url={getUrl(iframeType, { id, ticketId, modelId, modelCode })} />
      </Modal>
    )
  }
}
