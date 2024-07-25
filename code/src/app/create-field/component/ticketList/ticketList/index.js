import React, { Component, Fragment } from 'react'
import { observer } from 'mobx-react'
import TicketListStore from './stores/TicketListStore'
import SelectedTable from './components/SelectedTable'
import ListModal from './components/ListModal'
import './index.less'

@observer
export default class TickList extends Component {
  constructor (props) {
    super(props)

    this.ticketListStore = new TicketListStore()
  }

  // static defaultProps = {
  //   ticketListStore: new TicketListStore()
  // }

  componentDidMount () {
    const {
      value,
      onChange,
      field,
      forms,
      preview,
      allValue,
      setFieldsValue
    } = this.props
    // if (!forms && this.props.match.path === '/conf/model/advanced/:id') {
    //   forms = {
    //     modelId: this.props.match.params.id,
    //   }
    // }
    const dilver = {
      value,
      onChange,
      field,
      forms,
      preview,
      allValue,
      setFieldsValue
    }
    this.ticketListStore.setItsmProps(dilver)
    if (Array.isArray(value)) {
      this.ticketListStore.addItem(value)
    }
    // 创建阶段不用调接口。流转阶段才需要
    if (window.location.href.indexOf('ticket/createTicket') === -1) {
      const { getSavedRelatedTicket } = this.ticketListStore
      getSavedRelatedTicket(forms.ticketId)
    }

    this.initComponent()
  }

  initComponent = () => {
  }

  componentWillUnmount () {
    this.ticketListStore.resetStore()
  }

  render () {
    const { disabled } = this.props
    const { listModalVisible } = this.ticketListStore
    return (
      <div className="ticket-list">
        <SelectedTable disabled={disabled} ticketListStore={this.ticketListStore} />
        {listModalVisible && <ListModal ticketListStore={this.ticketListStore} />}
      </div>
    )
  }
}
