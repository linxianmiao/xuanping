import React, { Component } from 'react'
import { Provider, observer } from 'mobx-react'
import PropTypes from 'prop-types'
import All from './all'
import Others from './others'
import DraftList from './draftList'
import ProcessListStore from './switchModel/store/processListStore'
import TicketListStore from './others/store/ticketListStore'
import TicketStore from './stores/ticketStore'
import UserStore from './stores/userStore'

const ticketListStore = new TicketListStore()
const processListStore = new ProcessListStore()
const ticketStore = new TicketStore()
const userStore = new UserStore()

const othersList = ['myToDo', 'myFollow', 'myPartIn'] // 除了所有工单的路由

@observer
class TicketList extends Component {
    state = {
      filterUrl: 'myToDo' // 当前列表所在的路由
    }

    componentDidMount () {
      processListStore.getProcessList() // 获取工单模型列表
    }

    componentWillReceiveProps (nextProps) {
      const type = nextProps.params.type
      this.setState({ filterUrl: type })
    }

    getChildContext () {
      return {
        filterUrl: this.state.filterUrl
      }
    }

    render () {
      const { filterUrl } = this.state
      const dilver = {
        filterUrl,
        processListStore,
        ticketListStore
      }
      return (
        <Provider
          ticketListStore={ticketListStore}
          processListStore={processListStore}
          ticketStore={ticketStore}
          userStore={userStore}>
          <div>
            {othersList.includes(filterUrl) && <Others {...dilver} />}
            {filterUrl === 'all' && <All {...dilver} />}
            {filterUrl === 'drafts' && <DraftList />}
          </div>
        </Provider>
      )
    }
}
TicketList.childContextTypes = {
  filterUrl: PropTypes.string
}
export default TicketList
