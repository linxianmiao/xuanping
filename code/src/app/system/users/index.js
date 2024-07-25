import React, { Component } from 'react'
import { Provider } from 'mobx-react'
import UserMenu from './userMenu'
import UserManage from './userManage'
import UserGroupStore from './store/userGroupStore'
import UserListStore from './store/userListStore'
import './style/index.less'

const userGroupStore = new UserGroupStore()
const userListStore = new UserListStore()

class Index extends Component {
  componentWillUnmount () {
    userGroupStore.distory()
  }

  render () {
    return (
      <Provider store={userGroupStore} userStore={userListStore}>
        <div className="system-config-users">
          <UserMenu />
          <UserManage />
        </div>
      </Provider>
    )
  }
}

export default Index
