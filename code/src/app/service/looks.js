import React, { Component } from 'react'
import { toJS } from 'mobx'
import FromLooks from './formlooks'
import { Provider, observer } from 'mobx-react'
import ResourceStore from '../ticket-list/stores/resourceStore'
import UserStore from '../ticket-list/stores/userStore'
const resourceStore = new ResourceStore()
const userStore = new UserStore()
@observer
class ServiceLooks extends Component {
  render () {
    return (
      <Provider
        resourceStore={resourceStore}>
        <FromLooks {...this.props} userList={toJS(userStore.userList)} departList={toJS(userStore.departList)} />
      </Provider>
    )
  }
}
export default ServiceLooks
