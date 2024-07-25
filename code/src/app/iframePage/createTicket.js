import React, { Component } from 'react'
import { qs } from '@uyun/utils'
import { Spin, message } from '@uyun/components'
import { Provider, observer } from 'mobx-react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

import CreateTicket from '~/create-ticket/create'
import CreateStore from '~/create-ticket/stores/createStore'
import TicketStore from '../ticket-list/stores/ticketStore'
import ResourceStore from '../ticket-list/stores/resourceStore'
import UserStore from '../ticket-list/stores/userStore'
import TicketFieldJobStore from '~/stores/TicketFieldJobStore'
import ProcessListStore from '../ticket-list/switchModel/store/processListStore'

import { Prompt } from 'react-router-dom'
import PageHeader from '~/components/pageHeader'
import ErrorBoundary from '~/components/ErrorBoundary'
import Head from '~/create-ticket/head'
import { getFieldsCode } from '../ticket/forms/utils/scriptfunc'

const createStore = new CreateStore()
const ticketStore = new TicketStore()
const resourceStore = new ResourceStore()
const userStore = new UserStore()
const ticketFieldJobStore = new TicketFieldJobStore()
const processListStore = new ProcessListStore()

@observer
class CreateTicketWrap extends Component {
  static childContextTypes = {
    ticketId: PropTypes.string,
    ticketSource: PropTypes.string
  }

  createTicket = React.createRef()

  state = {
    loading: false,
    leaveNotify: false
  }

  get locationQuery() {
    const search = this.props.location.search.slice(1)
    return qs.parse(search)
  }

  // 工单需要的请求
  getTicketMes = async (props) => {
    this.setState({ loading: true })
    const { sourceId, AssetUpType, assetStorageType } = this.locationQuery
    const id = props.match.params.id
    if (props.location.pathname.indexOf('create') !== -1) {
      await createStore.intoCreateTicket(id, this.locationQuery, 'other')
      if (sourceId) {
        const resourceCodes = getFieldsCode(
          createStore.createTicket.fields,
          ['resource', 'asset'],
          'code'
        )
        await resourceStore.getCMDBResources(sourceId, resourceCodes, AssetUpType, assetStorageType)
      } else {
        resourceStore.getResList(null)
      }
    } else if (props.location.pathname.indexOf('drafts') !== -1) {
      await createStore.getTicketCache(id)
      resourceStore.getResList(null)
    }
    this.setState({ loading: false })
  }

  getChildContext() {
    const { ticketSource } = this.locationQuery
    return {
      ticketId: createStore.createTicket.ticketId,
      ticketSource: ticketSource
    }
  }

  // 给其他的项目组发送数据
  sendMessage = (data) => {
    const { ticketSource, hideHeader, hideHead, hideMenu } = this.locationQuery
    const { id: ticketId, flowNo } = data || {}
    if (ticketSource === 'chatops') {
      window.Chatops && window.Chatops.dialog.close()
    } else if (ticketSource === 'automation') {
      //  ie不支持 new Event事件
      let event
      try {
        event = new Event('callback')
      } catch (e) {
        event = document.createEvent('Event')
        event.initEvent('callback', true, true)
      }
      event.data = ticketId
      window.parent.document.dispatchEvent(event)
    } else {
      window.parent !== window
        ? window.parent.postMessage({ createTicket: 'success', ticketId, flowNo }, '*')
        : this.props.history.replace(
            `/ticketDetail/${ticketId}?ticketSource=${ticketSource}&hideHeader=${hideHeader}&hideHead=${hideHead}&hideMenu=${hideMenu}`
          )
    }
  }

  componentDidMount = async () => {
    resourceStore.checkUserPermission() // 检查cmdb权限
    this.getTicketMes(this.props)
    window.LOWCODE_APP_KEY = this.props.appkey
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this.getTicketMes(nextProps)
      this.onValuesChange(false)
    }
  }

  componentWillUnmount() {
    createStore.distory()
    window.LOWCODE_APP_KEY = ''
  }

  onValuesChange = (leaveNotify) => {
    const { ticketSource } = this.locationQuery
    // 当表单内容改变的时候，给asset发送一个信息
    if (ticketSource === 'asset' && leaveNotify) {
      window.parent.postMessage({ leaveNotify: true }, '*')
    }
    this.setState({ leaveNotify })
  }

  removeSandbox = () => {
    const resourceCodes = getFieldsCode(createStore.createTicket.fields, ['resource'], 'code')
    const resourceIds = resourceStore.resourceIds
    const resNow = this.createTicket.current.getFormsValue(resourceCodes) // 获取所有配置项的id
    const SanboxIds = _.map(resNow, (val) => _.map(val, (item) => item.id))
    resourceStore.distory() // 卸载配置项数据
    const delSanboxIds = SanboxIds.filter((item) => resourceIds.indexOf(item) === -1)
    if (!_.isEmpty(delSanboxIds)) {
      resourceStore.removeRelateResource(delSanboxIds)
    }
  }

  ticketFormsDetail = (data, type) => {
    try {
      if (type === 'get') {
        return this.createTicket.current.createForms.ticketforms.current.props.form.getFieldsValue()
      }
      this.createTicket.current.createForms.ticketforms.current.props.form.setFieldsValue(data)
    } catch (e) {
      message.error(e.message)
    }
  }

  render() {
    const { ticketSource, sourceUrl } = this.locationQuery
    const { createTicket: forms, processList: flowChart } = createStore
    const dilver = {
      forms,
      flowChart,
      sourceUrl,
      type: 'createTicket',
      operateType: 'createTicketAlert',
      sendMessage: this.sendMessage,
      id: this.props.match.params.id,
      onValuesChange: this.onValuesChange,
      locationQuery: this.locationQuery,
      matchParams: this.props.match.params,
      handleClick: this.handleOperationClick
    }
    return (
      <Provider
        createStore={createStore}
        ticketStore={ticketStore}
        userStore={userStore}
        resourceStore={resourceStore}
        ticketFieldJobStore={ticketFieldJobStore}
        processListStore={processListStore}
      >
        <React.Fragment>
          <PageHeader />
          <div
            className={classnames('create-ticket-wrap', {
              createTicketAlert: ticketSource === 'alert',
              'create-asset': ticketSource !== 'alert'
            })}
          >
            <Spin spinning={this.state.loading} delay={300}>
              {/* <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                <Head
                  {...dilver}
                  setFieldsValue={(data) => {
                    this.ticketFormsDetail(data, 'set')
                  }}
                  getTicketValues={() => this.ticketFormsDetail(null, 'get')}
                  inContainer={false}
                />
              </ErrorBoundary> */}
              <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                <CreateTicket
                  {...dilver}
                  wrappedComponentRef={this.createTicket}
                  memoryHistory={this.props.memoryHistory}
                  inContainer={'showTemp'}
                  setFieldsValue={(data) => {
                    this.ticketFormsDetail(data, 'set')
                  }}
                  getTicketValues={() => this.ticketFormsDetail(null, 'get')}
                />
              </ErrorBoundary>
            </Spin>
            <Prompt when={this.state.leaveNotify} message="" />
          </div>
        </React.Fragment>
      </Provider>
    )
  }
}
export default CreateTicketWrap
