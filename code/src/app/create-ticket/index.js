import React, { Component } from 'react'
import { i18n, qs } from '@uyun/utils'
import { store as runtimeStore } from '@uyun/runtime-react'
import { Spin, message } from '@uyun/components'
import { Provider, observer } from 'mobx-react'
import { toJS } from 'mobx'
import PropTypes from 'prop-types'
import CreateTicket from './create'
import CreateStore from './stores/createStore'
import TicketStore from '../ticket-list/stores/ticketStore'
import ResourceStore from '../ticket-list/stores/resourceStore'
import UserStore from '../ticket-list/stores/userStore'
import TicketFieldJobStore from '~/stores/TicketFieldJobStore'
import permissionListStore from '~/stores/permissionListStore'
import ProcessListStore from '../ticket-list/switchModel/store/processListStore'

import PageHeader from '~/components/pageHeader'
import Head from './head'
import KB from '../ticket/kb'
import { getFieldsCode } from '../ticket/forms/utils/scriptfunc'
import removeSideEffect from './removeSideEffect'
import Step from '~/components/step'
import ErrorBoundary from '~/components/ErrorBoundary'

const ticketFieldJobStore = new TicketFieldJobStore()
const createStore = new CreateStore()
const ticketStore = new TicketStore()
const resourceStore = new ResourceStore()
const userStore = new UserStore()
const processListStore = new ProcessListStore()

class CreateTicketWrap extends Component {
  constructor(props) {
    super(props)
    this.state = {
      iframeVisible: false,
      iframeSrc: '',
      iframeType: '',
      loading: false
    }
    this.createTicket = React.createRef()
  }

  static defaultProps = {
    _handleChangeLeaveNotify: () => {}
  }

  static childContextTypes = {
    ticketId: PropTypes.string,
    ticketSource: PropTypes.string
  }

  get locationQuery() {
    const search = this.props.location.search.slice(1)
    return qs.parse(search)
  }

  // 工单需要的请求
  getTicketMes = async (props) => {
    this.setState({ loading: true })
    const { ticketSource, sourceId, isCopy, copyTicketId } = this.locationQuery
    const id = props.match.params.id
    if (props.location.pathname.indexOf('create') !== -1) {
      if (ticketSource || isCopy) {
        const draftsData = ticketSource ? this.locationQuery : window.TICKET_COPY_DATA
        await createStore.intoCreateTicket(id, draftsData, 'other', '', copyTicketId) // 其他项目调
        window.TICKET_COPY_DATA = null
      } else {
        await createStore.intoCreateTicket(id) // itsm用
      }
      if (sourceId) {
        const resourceCodes = getFieldsCode(createStore.createTicket.fields, ['resource'], 'code')
        await resourceStore.getCMDBResources(sourceId, resourceCodes)
      } else {
        resourceStore.getResList(null)
      }
    } else if (props.location.pathname.indexOf('drafts') !== -1) {
      const formData = await createStore.getTicketCache(id)
      // 检查有没有权限自服务字段
      const fieldTypes = _.map(formData.fields, (field) => field.type)
      if (fieldTypes.includes('permission')) {
        // 获取当前工单关联的用户组数据
        permissionListStore.getRelatedGroupsOfTicket(formData.ticketId)
      }

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
    const urlSearch = new URLSearchParams(this.props.location?.search || '')
    if (urlSearch.get('isPostMessage')) {
      window.postMessage({ createTicket: 'success', flowNo: data.flowNo }, '*')
    } else {
      window.parent.postMessage({ createTicket: 'success', flowNo: data.flowNo }, '*')
    }
  }

  componentDidMount() {
    const { appkey } = this.locationQuery
    if (appkey) {
      window.LOWCODE_APP_KEY = appkey
    }
    resourceStore.checkUserPermission() // 检查cmdb权限
    this.getTicketMes(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this.getTicketMes(nextProps)
      this.onValuesChange(false)
    }
  }

  componentWillUnmount() {
    createStore.distory()
    resourceStore.distory() //销毁配置项数据
    window.LOWCODE_APP_KEY = ''
  }

  handleOperationClick = (type) => {
    if (type === 'search') {
      const title = this.createTicket.current.getFormsValue(['title']).title || ''
      this.setState({
        iframeVisible: true,
        iframeSrc: `/kb/search.html#/?outsideKeyword=${title}`,
        iframeType: type
      })
    }
  }

  closeModal = () => {
    this.setState({
      iframeVisible: false,
      iframeSrc: '',
      iframeType: ''
    })
  }

  onValuesChange = (leaveNotify) => {
    this.props._handleChangeLeaveNotify(leaveNotify)
  }

  // 获取form中codes的value
  getFormCodesValue = (codes) => {
    const resourceCodes = getFieldsCode(createStore.createTicket.fields, codes, 'code')
    const current = this.createTicket.current.getFormsValue(resourceCodes)
    return current
  }

  ticketFormsDetail = (data, type) => {
    // 保存模板id
    if (data && data.ticketTemplateId) {
      createStore.setTicketTemplateId(data.ticketTemplateId)
      delete data.ticketTemplateId
    } else {
      createStore.setTicketTemplateId()
    }

    if (type === 'get') {
      return this.createTicket.current.createForms.ticketforms.current.props.form.getFieldsValue()
    }
    try {
      this.createTicket.current.createForms.ticketforms.current.props.form.setFieldsValue(data)
    } catch (e) {
      message.error(e.message)
    }
  }

  setFieldsValue = (data) => {
    try {
      this.createTicket.current.createForms.ticketforms.current.props.form.setFieldsValue(data)
    } catch (e) {
      message.error(e.message)
    }
  }

  render() {
    const { sourceUrl, headerInfo = '' } = this.locationQuery
    const {
      createTicket: forms,
      processList: flowChart,
      ticketTemplateId,
      draftsData,
      parentTicketData
    } = createStore
    const { iframeVisible, iframeSrc, iframeType } = this.state
    const { authorizedApps } = runtimeStore.getState()
    const isKB = _.some(authorizedApps, (item) => item.code === '1018')
    const sourceType =
      draftsData.cacheType === '1' || draftsData.cacheType === '2' ? 'subOrService' : ''
    const dilver = {
      forms,
      message: {
        title: forms.title,
        modelName: forms.modelName,
        num: forms.ticketNum,
        source: null
      },
      history: this.props.history,
      flowChart,
      sourceUrl,
      draftsData,
      parentTicketData,
      sourceType,
      kb: isKB ? 1 : 0,
      handleClick: this.handleOperationClick,
      operateType: 'createTicket',
      type: 'createTicket',
      id: this.props.match.params.id,
      onValuesChange: this.onValuesChange,
      sendMessage: this.sendMessage,
      locationQuery: this.locationQuery,
      matchParams: this.props.match.params,
      ticketTemplateId: ticketTemplateId
    }
    const modelStageVoList = toJS(forms.modelStageVoList)
    return (
      <Provider
        createStore={createStore}
        ticketStore={ticketStore}
        userStore={userStore}
        ticketFieldJobStore={ticketFieldJobStore}
        resourceStore={resourceStore}
        processListStore={processListStore}
      >
        <React.Fragment>
          <PageHeader customizeBreadcrumb={[{ name: '新建工单' }]} />
          <div className="create-ticket-wrap">
            <Spin spinning={this.state.loading} delay={300}>
              <CreateTicket
                wrappedComponentRef={this.createTicket}
                {...dilver}
                headerInfo={headerInfo}
                source={this.props.source}
                setFieldsValue={(data) => {
                  this.ticketFormsDetail(data, 'set')
                }}
                getTicketValues={() => this.ticketFormsDetail(null, 'get')}
                inContainer={false}
              />
            </Spin>
            <KB
              onClose={this.closeModal}
              visible={iframeVisible}
              src={iframeSrc}
              type={iframeType}
            />
          </div>
        </React.Fragment>
      </Provider>
    )
  }
}
export default removeSideEffect(observer(CreateTicketWrap), {
  resourceStore,
  ticketFieldJobStore,
  createStore
})
