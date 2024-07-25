import React, { Component } from 'react'
import { toJS } from 'mobx'
import { store as runtimeStore } from '@uyun/runtime-react'
import { Spin, message } from '@uyun/components'
import classnames from 'classnames'
import { observer, Provider, inject } from 'mobx-react'
import ServiceStore from './stores/serviceStore'
import Head from '../create-ticket/head'
import ContentLayout from '~/components/ContentLayout'
import Forms from '../ticket/forms'
import KB from '../ticket/kb'
import { getPerUrl } from '~/components/common/getPerUrl'
import CreateStore from '../create-ticket/stores/createStore'
import ResourceStore from '../ticket-list/stores/resourceStore'
import UserStore from '../ticket-list/stores/userStore'
import TicketFieldJobStore from '~/stores/TicketFieldJobStore'
import TicketStore from '../ticket-list/stores/ticketStore'
import ProcessListStore from '../ticket-list/switchModel/store/processListStore'
import permissionListStore from '~/stores/permissionListStore'
import AdvancedCreateBtn from '../create-ticket/advancedCreateBtn'
import ServiceGuide from './serviceGuide'
import { formItemLayoutType1 } from '../ticket/common/formItemLayoutType'
import { withRouter } from 'react-router-dom'
import { qs } from '@uyun/utils'
import { realSubmit } from '~/ticket/forms/utils/scriptfunc'
import './styles/index.less'

const createStore = new CreateStore()
const serviceStore = new ServiceStore()
const resourceStore = new ResourceStore()
const userStore = new UserStore()
const ticketFieldJobStore = new TicketFieldJobStore()
const ticketStore = new TicketStore()
const processListStore = new ProcessListStore()

@inject('globalStore', 'tableListStore', 'loadFieldWidgetStore')
@withRouter
@observer
class CreateSerice extends Component {
  state = {
    iframeVisible: false,
    iframeSrc: '',
    iframeType: '',
    formList: {},
    loading: false,
    visible: true,
    ticketId: ''
  }

  get locationQuery() {
    const search = this.props.location.search.slice(1)
    return qs.parse(search)
  }

  componentDidMount() {
    resourceStore.checkUserPermission() // 检查cmdb权限
    this.props.globalStore.isHavePrivilege() // 查询产品权限
    this.getServiceData(this.props.match.params.id)
    if (window.location.href.includes('service.html') > -1) {
      this.props.loadFieldWidgetStore.getCustomFieldInfos()
    }
  }

  getServiceData = async (id) => {
    this.setState({ loading: true })
    const res = await serviceStore.getSrvItems(id)
    const { code, service_model } = res || {}

    if (service_model === 2) {
      resourceStore.getResList(null)
      const modelId = JSON.parse(res.content).ticket
      const dynaParams = JSON.parse(res.dyna_params)
      const params = {
        source: 'catalog',
        srvItemCode: code
      }
      const data = await serviceStore.getCreateTicket(modelId, params)
      this.setState({ ticketId: data.ticketId })
      const formList = _.cloneDeep(data)
      _.forEach(formList.formLayoutVos, (item) => {
        if (item.type === 'group') {
          _.forEach(item.fieldList, (field) => {
            if (dynaParams[field.code] || typeof dynaParams[field.code] === 'number') {
              field.defaultValue = dynaParams[field.code]
            }
          })
        } else {
          _.forEach(item.tabs, (tab) => {
            _.forEach(tab.fieldList, (field) => {
              if (dynaParams[field.code] || typeof dynaParams[field.code] === 'number') {
                field.defaultValue = dynaParams[field.code]
              }
            })
          })
        }
      })
      this.setState({ formList, loading: false })
    } else {
      this.setState({ loading: false })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible !== prevState.visible && this.locationQuery.source === 'mycatalog') {
      this.getServiceData(prevProps.match.params.id)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.getServiceData(nextProps.match.params.id)
    }
  }

  handleOperationClick = (type) => {
    if (type === 'search') {
      const title = this.tickets.ticketforms.current.props.form.getFormsValue(['title']).title || ''
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

  validate = async (callback, item) => {
    await this.tickets.validateFieldsValue(item)
    const tickets = this.tickets.ticketforms.current.props.form.getFieldsValue()
    callback(tickets)
  }

  getFormsValue = (code) => this.tickets.ticketforms.current.props.form.getFieldsValue(code)

  // -----合并执行人及处理意见数据-----//
  manageData = (data) => {
    function parseDom(arg) {
      const objE = document.createElement('div')
      objE.innerHTML = arg
      return objE.childNodes
    }
    const toUserList = []
    if (!data.message) {
      data.message = ''
    }
    const matchADom = data.message.match(/<a user_id="([a-fA-F0-9]{32})" >(.*?)<\/a>/gi)
    _.map(matchADom, (dom) => {
      const aDom = parseDom(dom)
      const name = aDom[0].innerHTML
      data.message = data.message.replace(dom, name)
      toUserList.push(aDom[0].getAttribute('user_id'))
    })
    data.message = data.message.replace(/\n/g, '<br/>')
    const commentData = data
    data.message = {
      toUserList,
      content: data.message || ''
    }
    const { forms } = toJS(serviceStore)
    data.modelId = forms.modelId
    return commentData
  }

  handleOk = async (submitData, type, callback) => {
    const tickets = this.tickets.ticketforms.current.props.form.getFieldsValue()
    const { serviceData, forms } = toJS(serviceStore)
    const { userId, tenantId } = runtimeStore.getState().user || {}
    const data = {
      uyun_creator: userId,
      tenantId,
      srvitemId: serviceData.id,
      type: serviceData.service_model,
      source: 0
    }
    const { formList } = this.state
    // 字段有默认值，然后删除完以后为undefined，不会传给后端，这个时候在下一个环节的时候，还会有默认值
    _.forEach(tickets, (value, key) => {
      tickets[key] = value === undefined ? null : value
    })
    const resourceCodes = []
    _.forEach(formList.formLayoutVos, (item) => {
      if (item.type === 'group') {
        _.forEach(item.fieldList, (field) => {
          if (field.type === 'resource') {
            resourceCodes.push(field.code)
          }
        })
      } else {
        _.forEach(item.tabs, (tab) => {
          _.forEach(tab.fieldList, (field) => {
            if (field.type === 'resource') {
              resourceCodes.push(field.code)
            }
          })
        })
      }
    })
    _.forEach(resourceCodes, (d) => {
      if (Array.isArray(tickets[d])) {
        tickets[d] = _.filter(tickets[d], (d2) => !d2.taskId)
      }
    })
    // 处理意见处理
    let messageData = {}
    if (type !== 'save') {
      messageData = this.manageData(submitData)
    }

    const commentData = _.assign({}, messageData, { form: tickets, ticketId: forms.ticketId })
    // 脚本处理
    try {
      await realSubmit(forms, commentData, type)
    } catch (e) {
      // message.error('onrealsubmit脚本返回了' + e.message)
      console.log('onrealsubmit脚本返回了' + e.message)
      return false
    }
    if (resourceStore.sandboxId) {
      tickets.sandboxId = resourceStore.sandboxId
    }
    let res
    if (serviceData.service_model === 1) {
      res = await serviceStore.service_normal_create(data)
    } else if (serviceData.service_model === 2) {
      const ticketData = _.assign(
        {},
        {
          form: tickets,
          modelId: forms.modelId,
          ticketId: forms.ticketId
        },
        _.omit(submitData, ['flowCode'])
      )

      resourceStore.postResList(forms.ticketId, forms.modelId) // 提交配置项数据
      await permissionListStore.postPermissionList(forms.ticketId) // 提交服务自权限数据
      ticketFieldJobStore.job_relate(forms.ticketId) // 提交作业数据
      await this.props.tableListStore.saveTableData(true) // 保存表格字段数据
      // 清空原表格字段的默认数据
      this.props.tableListStore.list.forEach((store) => {
        ticketData.form[store.params.fieldCode] = []
      })
      if (type === 'save') {
        const getServiceSaveData = {
          form: ticketData.form,
          ticketId: ticketData.ticketId,
          cacheType: '2', // '2' 代表服务目录保存草稿
          serviceRecordVO: data,
          executorAndGroup: ticketData.executorAndGroup
        }
        const result = await serviceStore.ticketSave(ticketData.modelId, getServiceSaveData)
        if (result) {
          message.success(i18n('save_success', '保存成功'))
        }
      } else {
        res = await serviceStore.service_ticket_create({ service: data, ticket: ticketData })
      }
    }
    if (+res === 200) {
      if (this.locationQuery.source === 'mycatalog') {
        message.success('创建成功')
        setTimeout(() => {
          window.parent.postMessage(
            {
              createTicket: 'success',
              message: '创建成功',
              type: 'close_window'
            },
            '*'
          )
        }, 300)
      } else {
        this.props.globalStore.getFilterType() // 刷新左侧菜单的数字
        this.props.history.replace(getPerUrl(this.props.globalStore.defaultHome))
        callback && callback()
      }
    }
  }

  getChildContext() {
    return { ticketId: serviceStore.forms.ticketId }
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
      return this.tickets.ticketforms.current.props.form.getFieldsValue()
    }
    try {
      this.tickets.ticketforms.current.props.form.setFieldsValue(data)
    } catch (e) {
      message.error(e.message)
    }
  }

  componentWillUnmount() {
    resourceStore.distory() // 卸载配置项数据
  }

  render() {
    const { serviceData, processList: flowChart } = toJS(serviceStore)
    const { iframeVisible, iframeSrc, iframeType, formList, loading, ticketId } = this.state
    const source = this.locationQuery.source
    const { ticketTemplateId } = createStore
    const formDilver = {
      kb: 1,
      locationSource: source,
      forms: formList,
      id: formList.modelId,
      ticketId,
      validate: this.validate,
      preview: false,
      disabled: false,
      ticketType: 'edit',
      operateType: 'createTicketAlert',
      handleClick: this.handleOperationClick,
      popupContainerId: 'ticket-service-warp',
      handOk: this.handleOk,
      sourceType: 'subOrService',
      ticketTemplateId: ticketTemplateId,
      flowChart,
      getFormsValue: this.getFormsValue,
      createService: true
    }

    return (
      <Provider
        userStore={userStore}
        resourceStore={resourceStore}
        ticketFieldJobStore={ticketFieldJobStore}
        ticketStore={ticketStore}
        processListStore={processListStore}
        createStore={createStore}
      >
        <div
          className={classnames('create-service-ticket', {
            mycatalog: source === 'mycatalog'
          })}
        >
          {source === 'mycatalog' ? null : (
            <div style={{ lineHeight: '42px' }}>{`创建${serviceData.name}`}</div>
          )}
          <ContentLayout>
            <Spin spinning={loading} delay={300}>
              <Head
                {...this.props}
                locationQuery={this.locationQuery}
                //   unProcessBtn
                {...formDilver}
                setFieldsValue={(data) => {
                  this.ticketFormsDetail(data, 'set')
                }}
                getTicketValues={() => this.ticketFormsDetail(null, 'get')}
                inContainer={'showTemp'}
              />
              {serviceData.service_model === 2 ? (
                <div className="ticket-service-warp" id="ticket-service-warp">
                  <Forms
                    ref={(node) => {
                      this.tickets = node
                    }}
                    {...this.props}
                    {...formDilver}
                  />
                  {/* <AdvancedCreateBtn {...formDilver} /> */}
                </div>
              ) : (
                <ServiceGuide serviceData={serviceData} formItemLayout={formItemLayoutType1} />
              )}
              <KB
                onClose={this.closeModal}
                visible={iframeVisible}
                src={iframeSrc}
                type={iframeType}
              />
            </Spin>
          </ContentLayout>
        </div>
      </Provider>
    )
  }
}
export default CreateSerice
