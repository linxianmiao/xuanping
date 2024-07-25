import React, { Component } from 'react'
import { Button, Modal } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import Jump from '~/ticket/submitView/jump'

function TacheFalt(jumpTache) {
  const { tacheType, parallelismTaches } = jumpTache
  if (tacheType === 1) {
    return _.filter(parallelismTaches, paralle => paralle.policy === 1)
  } else {
    return jumpTache.policy === 1 ? [jumpTache] : []
  }
}
@inject('ticketStore', 'ticketSubmitStore')
@observer
export default class DetailBtn extends Component {
  constructor (props) {
    super(props)
    this.submitRef = React.createRef()
    this.state = {
      action: '', // 提交的工作
      visible: false, // 提交状态
      loading: false, // 提交按钮的
      confirmLoading: false, // 弹框状态
      tacheList: [], // 当前需要指定人的环节
      currrentTitle: '', // 弹框的title
      currrentForms: '', // 当前表单的值
      activityFlowId: '' // 线id
    }
  }

  handleClick = (item) => {
    this.props.validate((values) => {
      this.handleSubmitStart(item, values)
    })
  }

  handleSubmitStart = async (item, values) => {
    const { ticketId, caseId, tacheId } = this.props.ticketStore.detailForms
    this.setState({ loading: true })
    const res = await this.props.ticketSubmitStore.getActivityById({ id: ticketId, caseId, tacheId, status: 1, form: values })
    const submitTache = _.find(res.ruleVos, rule => {
      return rule.activityFlowId === item.activityFlowId
    })
    const tacheList = TacheFalt(submitTache.jumpTache)
    if (tacheList.length === 0) {
      this.setState({
        action: 'jump',
        activityFlowId: submitTache.activityFlowId
      }, () => {
        this.handleSubmitEnd()
      })
    } else {
      this.setState({
        tacheList,
        loading: false,
        visible: true,
        action: 'jump',
        currrentForms: values,
        currrentTitle: submitTache.name,
        activityFlowId: submitTache.activityFlowId
      })
    }
  }

  handleSubmitEnd = async (values) => {
    const { ticketId, tacheType, tacheNo, caseId, tacheId, modelId } = this.props.ticketStore.detailForms
    const { activityFlowId, action } = this.state
    const data = {
      caseId,
      tacheType,
      tacheNo,
      tacheId,
      ticketId,
      modelId,
      flowId: activityFlowId,
      executorsAndGroupIds: values
    }
    this.setState({ confirmLoading: true })
    await this.props.handleOk(data, action)
    this.setState({ confirmLoading: false, action: '', visible: false, loading: false })
  }

  handleOk = () => {
    this.submitRef.current.props.form.validateFields((errors, values) => {
      if (errors) return false
      this.handleSubmitEnd(values)
    })
  }

  handleCancel = () => {
    this.setState({ visible: false, action: '' })
  }

  _render = () => {
    const { tacheList, currrentForms, activityFlowId, action } = this.state
    const { ticketId, caseId, modelId } = this.props.ticketStore.detailForms
    const dilver = {
      ticketId, caseId, tacheList, modelId, handleType: action, flowId: activityFlowId, currrentForms
    }
    if (action === 'jump') {
      return <Jump wrappedComponentRef={this.submitRef} {...dilver} />
    }
  }

  render () {
    const { currentActivity } = this.props.ticketSubmitStore
    const { visible, loading, confirmLoading, currrentTitle } = this.state

    return (
      <div>
        <div style={{ textAlign: 'center' }}>
          {_.map(currentActivity.ruleVos, (item, index) => {
            return <Button disabled={loading} key={index} type="primary" onClick={() => { this.handleClick(item) }}>{item.name}</Button>
          })}
        </div>
        <Modal
          destroyOnClose
          confirmLoading={confirmLoading}
          title={currrentTitle}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.hanleCancel}>
          {this._render()}
        </Modal>
      </div>
    )
  }
}
