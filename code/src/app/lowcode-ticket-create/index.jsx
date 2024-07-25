import React from 'react'
import { HashRouter } from 'react-router-dom'
import { Provider } from 'mobx-react'
import stores from '~/stores'
import CreateTicket from '~/create-ticket/create'

import CreateStore from '~/create-ticket/stores/createStore'
import TicketStore from '../ticket-list/stores/ticketStore'
import ResourceStore from '../ticket-list/stores/resourceStore'
import UserStore from '../ticket-list/stores/userStore'
import TicketFieldJobStore from '~/stores/TicketFieldJobStore'

const ticketFieldJobStore = new TicketFieldJobStore()
const createStore = new CreateStore()
const ticketStore = new TicketStore()
const resourceStore = new ResourceStore()
const userStore = new UserStore()

function LowcodeTicketCreate(props) {
  // const dilver = {
  //   forms: ticket,
  //   formsData: form,
  //   operateType: 'createTicket',
  //   onValuesChange: () => {},

  //   history: {}
  // }

  return (
    <HashRouter>
      <Provider
        {...stores}
        createStore={createStore}
        ticketStore={ticketStore}
        userStore={userStore}
        ticketFieldJobStore={ticketFieldJobStore}
        resourceStore={resourceStore}
      >
        <CreateTicket {...props} />
      </Provider>
    </HashRouter>
  )
}

export default LowcodeTicketCreate
