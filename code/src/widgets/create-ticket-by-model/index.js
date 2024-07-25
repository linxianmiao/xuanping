import React, { Component } from 'react'
import { Provider } from 'mobx-react'
import { MemoryRouter } from 'react-router-dom'
import '~/common/common'
import '../../entry/system/map'
import 'moment/locale/zh-cn'
import { message } from '@uyun/components'
import CreateTicket from '~/create-ticket/create.js'
import globalStore from '~/stores/globalStore'
import CreateStore from '~/create-ticket/stores/createStore'
import TicketStore from '~/ticket-list/stores/ticketStore'
import ResourceStore from '~/ticket-list/stores/resourceStore'
import UserStore from '~/ticket-list/stores/userStore'
import TicketFieldJobStore from '~/stores/TicketFieldJobStore'
import permissionListStore from '~/stores/permissionListStore'
import ProcessListStore from '~/ticket-list/switchModel/store/processListStore'
import loadFieldWidgetStore from '~/stores/loadFieldWidgetStore'
import tableListStore from '~/stores/tableListStore'
import userPickStore from '~/stores/userPickStore'
import ticketTemplateStore from '~/stores/ticketTemplateStore'
import templateListStore from '~/stores/templateListStore'

const ticketFieldJobStore = new TicketFieldJobStore()
const createStore = new CreateStore()
const ticketStore = new TicketStore()
const resourceStore = new ResourceStore()
const userStore = new UserStore()
const processListStore = new ProcessListStore()

class CreateTicketByModel extends Component {
  constructor(props) {
    super(props)
    this.createTicket = React.createRef()
  }
  static defaultProps = {
    modelId: 'db079ed5aea545c4b1f74ae3656e3a8c'
  }

  componentDidMount() {
    const { appkey } = this.props
    if (appkey) {
      window.LOWCODE_APP_KEY = appkey
    }
    resourceStore.checkUserPermission() // 检查cmdb权限
    this.getTicketMes(this.props)
    loadFieldWidgetStore.getCustomFieldInfos()
    globalStore.getAutomationPer() //检查auto权限
    globalStore.getSwitch()
    globalStore.checkShowStatusButton()
    globalStore.getFilterNamesByRegular()
    globalStore.checkConfigAuthor()
    globalStore.checkListOperation()
    globalStore.getTicketUrgingTime()
  }

  // 工单需要的请求
  getTicketMes = async (props) => {
    this.setState({ loading: true })
    const { modelId } = props

    await createStore.intoCreateTicket(modelId) // itsm用

    resourceStore.getResList(null)
    this.setState({ loading: false })
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

  render() {
    const { modelId } = this.props
    const {
      createTicket: forms,
      processList: flowChart,
      draftsData,
      parentTicketData
    } = createStore
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
      draftsData,
      parentTicketData,
      handleClick: this.handleOperationClick,
      operateType: 'createTicket',
      type: 'createTicket',
      id: modelId,
      onValuesChange: this.onValuesChange,
      sendMessage: this.sendMessage,
      locationQuery: this.locationQuery,
      inContainer: false,
      source: 'biz-component'
    }
    return (
      <div className="create-ticket-by-model">
        <Provider
          globalStore={globalStore}
          createStore={createStore}
          ticketStore={ticketStore}
          userStore={userStore}
          ticketFieldJobStore={ticketFieldJobStore}
          resourceStore={resourceStore}
          processListStore={processListStore}
          permissionListStore={permissionListStore}
          loadFieldWidgetStore={loadFieldWidgetStore}
          tableListStore={tableListStore}
          userPickStore={userPickStore}
          ticketTemplateStore={ticketTemplateStore}
          templateListStore={templateListStore}
        >
          <MemoryRouter>
            <CreateTicket
              wrappedComponentRef={this.createTicket}
              {...dilver}
              setFieldsValue={(data) => {
                this.ticketFormsDetail(data, 'set')
              }}
            />
          </MemoryRouter>
        </Provider>
      </div>
    )
  }
}

export default CreateTicketByModel
