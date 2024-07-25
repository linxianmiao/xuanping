import React, { Component } from 'react'
import { Provider, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Prompt } from 'react-router-dom'
import { Tabs } from './layout'
import PageHeader from '~/components/pageHeader'
import BasicInfoStore from './store/basicInfoStore'
import SelectUserStore from './store/selectUserStore'
import SelectGroupsStore from './store/selectGroupsStore'
import FieldListStore from './store/fieldListStore'
import FlowStore from './store/flowStore'
import FlowListStore from './store/FlowListStore'
import ModelFieldListStore from './store/ModelFieldListStore'
import LeaveStore from './store/leaveStore'
import UserStore from '../ticket-list/stores/userStore'
import ResourceStore from '../ticket-list/stores/resourceStore'
import ParamStore from './store/paramStore'
import TriggerStore from './store/triggerStore'
import matrixStore from '../system/stores/matrixStore'
import TicketFieldJobStore from '~/stores/TicketFieldJobStore'
import TicketStore from '../ticket-list/stores/ticketStore'
import CreateStore from '../create-ticket/stores/createStore'
import ProcessListStore from '../ticket-list/switchModel/store/processListStore'
import ErrorBoundary from '~/components/ErrorBoundary'
import getURLParam from '~/utils/getUrl'

import './index.less'

const basicInfoStore = new BasicInfoStore()
const selectUserStore = new SelectUserStore()
const leaveStore = new LeaveStore()
const selectGroupsStore = new SelectGroupsStore()
const fieldListStore = new FieldListStore()
const userStore = new UserStore()
const flowStore = new FlowStore()
const flowListStore = new FlowListStore()
const paramStore = new ParamStore()
const resourceStore = new ResourceStore()
const triggerStore = new TriggerStore()
const ticketFieldJobStore = new TicketFieldJobStore()
const modelFieldListStore = new ModelFieldListStore()
const ticketStore = new TicketStore()
const createStore = new CreateStore()
const processListStore = new ProcessListStore()

@observer
class Index extends Component {
  getChildContext() {
    const modelId = this.props.id || this.props.match.params.id || ''
    return { modelId: modelId }
  }

  componentDidMount() {
    window.LOWCODE_APP_KEY = getURLParam('appkey')
  }

  componentWillUnmount() {
    leaveStore.distory()
    fieldListStore.distroy()
    window.LOWCODE_APP_KEY = ''
  }

  render() {
    const { basicInfoSave, fieldSave, flowSave } = leaveStore
    const when = basicInfoSave + fieldSave + flowSave > 0
    return (
      <Provider
        basicInfoStore={basicInfoStore}
        selectUserStore={selectUserStore}
        selectGroupsStore={selectGroupsStore}
        fieldListStore={fieldListStore}
        leaveStore={leaveStore}
        userStore={userStore}
        flowListStore={flowListStore}
        flowStore={flowStore}
        resourceStore={resourceStore}
        triggerStore={triggerStore}
        matrixStore={matrixStore}
        ticketFieldJobStore={ticketFieldJobStore}
        modelFieldListStore={modelFieldListStore}
        paramStore={paramStore}
        ticketStore={ticketStore}
        createStore={createStore}
        processListStore={processListStore}
      >
        <div className={window.LOWCODE_APP_KEY ? 'lowcode-model' : 'model'}>
          <Prompt when={when} message="" />
          {!window.LOWCODE_APP_KEY && <PageHeader />}
          <ErrorBoundary desc={i18n('loadFail')}>
            <Tabs />
          </ErrorBoundary>
        </div>
      </Provider>
    )
  }
}
Index.childContextTypes = {
  modelId: PropTypes.string
}
export default Index
