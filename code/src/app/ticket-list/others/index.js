import React, { Component } from 'react'
import { autorun, toJS } from 'mobx'
import { observer } from 'mobx-react'
import SwitchModel from '../switchModel'
import Screen from '../screen'
import TableOrCard from './tableOrCard'
import './style/index.less'

@observer
class Others extends Component {
  componentDidMount () {
    this.disposer = autorun(() => {
      const newData = _.assign(toJS(this.props.ticketListStore.screenData), { filterType: this.props.filterUrl })
      this.props.ticketListStore.getTicketList(newData)
    })
  }

  componentWillUnmount () {
    this.disposer()
  }

  render () {
    const diliver = {
      ticketListStore: this.props.ticketListStore,
      processListStore: this.props.processListStore
    }
    return (
      <div id="ticket-list">
        <SwitchModel {...diliver} />
        <Screen {...diliver} />
        <TableOrCard {...diliver} />
      </div>
    )
  }
}

export default Others
