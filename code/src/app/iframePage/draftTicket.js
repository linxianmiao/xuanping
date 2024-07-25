import React, { Component } from 'react'
import { qs } from '@uyun/utils'
import PropTypes from 'prop-types'
import { Provider, observer, inject } from 'mobx-react'
import { store as runtimeStore } from '@uyun/runtime-react'

import Forms from '../ticket/forms'
import DraftsButton from './draftsButton'
import TicketStore from '../stores/ticketStore'
import TicketSubmitStore from '../stores/ticketSubmitStore'
import UserStore from '../ticket-list/stores/userStore'
import ResourceStore from '../ticket-list/stores/resourceStore'
import TicketFieldJobStore from '~/stores/TicketFieldJobStore'

const ticketStore = new TicketStore()
const ticketSubmitStore = new TicketSubmitStore()
const userStore = new UserStore()
const resourceStore = new ResourceStore()
const ticketFieldJobStore = new TicketFieldJobStore()
@inject('globalStore')
@observer
export default class DraftsTicket extends Component {
  constructor(props) {
    super(props)
    this.details = React.createRef()
  }

  get locationQuery() {
    const search = this.props.location.search.slice(1)
    return qs.parse(search)
  }

  static childContextTypes = {
    ticketId: PropTypes.string,
    ticketSource: PropTypes.string
  }

  getChildContext() {
    const { ticketSource } = this.locationQuery
    return {
      ticketId: ticketStore.detailForms.ticketId,
      ticketSource: ticketSource
    }
  }

  componentDidMount = async () => {
    this.props.globalStore.isHavePrivilege() // 查询产品权限
    this.getDetailForms(this.props)
  }

  // 给其他的项目组发送数据
  sendMessage = submitData => {
    const { ticketSource } = this.locationQuery
    if (ticketSource === 'automation') {
      //  ie不支持 new Event事件
      let event
      try {
        event = new Event('callback')
      } catch (e) {
        event = document.createEvent('Event')
        event.initEvent('callback', true, true)
      }
      event.data = submitData.ticketId
      window.parent.document.dispatchEvent(event)
    }
  }

  // 获取工单详情
  getDetailForms = async props => {
    resourceStore.checkUserPermission() // 检查cmdb权限
    const res = await ticketStore.getTicketDetail({ ticketId: props.match.params.id })
    const { ticketId, caseId, tacheId, modelId } = res
    if (res.source === 'srvcat') {
      ticketStore.getTicketSrvcat(ticketId)
    }
    ticketSubmitStore.getActivityById({ id: ticketId, caseId, tacheId, status: 1 })
    resourceStore.getResList(ticketId, { tacheId, caseId, modelId }) // 获取工单的cmdb数据
    ticketFieldJobStore.job_query(ticketId) // 获取工单的数据
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this.getDetailForms(nextProps)
    }
  }

  componentWillUnmount() {
    ticketStore.distory() // 初始化数据
  }

  handleOk = async (data, type) => {
    const fromData =
      this.details.current.ticketforms.current.props.form &&
      this.details.current.ticketforms.current.props.form.getFieldsValue() // 获取提交的表单数据
    // 问题 ： 字段有默认值，然后删除完以后为undefined，不会传给后端，这个时候在下一个环节的时候，还会有默认值
    _.forEach(fromData, (value, key) => {
      fromData[key] = value === undefined ? null : value
    })
    const submitData = _.assign({}, data, { form: fromData })

    let result = null
    switch (type) {
      case 'jump': // 跳转
      case 'submit':
        result = await ticketSubmitStore.ticketSubmit(submitData)
        break // 提交
    }
    result && this.sendMessage(submitData)
    return result
  }

  // 点击按钮以后进行校验
  validate = fn => {
    this.details.current.validateFieldsValue().then(
      res => {
        fn(res)
      },
      error => {
        console.log(error)
      }
    )
  }

  render() {
    const { detailForms, serviceData } = ticketStore
    const { ticketSource } = this.locationQuery

    const isProcess =
      detailForms.status === 2 && detailForms.currexcutor === runtimeStore.getState().user?.userId // 工单是否可以处理

    const dilver = {
      serviceData,
      ticketSource,
      type: 'detail',
      forms: detailForms,
      disabled: !isProcess,
      validate: this.validate, // 工单校验
      handleOk: this.handleOk // 工单提交
    }
    return (
      <Provider
        ticketSubmitStore={ticketSubmitStore}
        ticketStore={ticketStore}
        resourceStore={resourceStore}
        userStore={userStore}
        ticketFieldJobStore={ticketFieldJobStore}
      >
        <div>
          {<Forms ref={this.details} {...dilver} {...this.props} />}
          <DraftsButton handleOk={this.handleOk} validate={this.validate} />
        </div>
      </Provider>
    )
  }
}
