import React, { Component } from 'react'
import { Modal, Table } from '@uyun/components'
import { observer } from 'mobx-react'
import { reaction, toJS } from 'mobx'
import * as R from 'ramda'
import { userModalColumns, filterAddUsers, filterRemoveUsers } from '../logic'

// 格式化用户
export function formatUser(user, others = {}) {
  return {
    ...others,
    userId: user.userId,
    userAccount: user.account,
    userName: user.realname,
    userEmail: user.email
  }
}

@observer
export default class RemoveUserModal extends Component {
  state = {
    visible: false
  }

  get store() {
    return this.props.store
  }

  openModal = (group) => {
    this.store.setProps({
      currentGroup: group,
      selectedUsers: filterRemoveUsers(group.relatedUsers)
    })
    this.setState({ visible: true })
  }

  closeModal = () => {
    this.setState({ visible: false }, () => {
      this.store.setProps({
        selectedUsers: [],
        currentGroup: null
      })
    })
  }

  submitModal = () => {
    const addUsers = filterAddUsers(this.store.currentGroup.relatedUsers)
    const { currentGroup } = this.store
    this.store.setProps({
      ...currentGroup,
      relatedUsers: [...addUsers, ...this.store.selectedUsers]
    })
    _.forEach(this.store.panels, (d) => {
      if (d.rowId === currentGroup.rowId) {
        d.relatedUsers = [...addUsers, ...this.store.selectedUsers]
      }
    })
    this.closeModal()
  }

  handleUserSelect = (_, rows) => {
    this.store.setProps({ selectedUsers: rows })
  }

  getUserList = async () => {
    this.store.setProps({ loadMoreRemoveUser: true })
    const { currentGroup } = this.store
    const pageIndex = currentGroup.page + 1
    const params = { groupId: currentGroup.applicationId, pageIndex, pageSize: 20 }
    const res = await axios.get(API.listUsersByGroupId, { params })
    const reslist = (res ? res.list : []).map((item) => formatUser(item, { type: 1 }))
    const newUserList =
      currentGroup && currentGroup.userList ? toJS(currentGroup.userList).concat(reslist) : []
    const userListCountG = currentGroup && currentGroup.userListCount
    const loadMore = userListCountG > newUserList.length ? false : 'finished'

    _.forEach(this.store.panels, (d) => {
      if (d.rowId === currentGroup.rowId) {
        d.userList = newUserList
      }
    })

    this.store.setProps({
      currentGroup: {
        ...currentGroup,
        page: pageIndex,
        loadMoreRemoveUser: loadMore,
        userList: newUserList
      }
    })
    this.forceUpdate()
  }

  render() {
    const { visible } = this.state
    const { group } = this.props
    const { selectedUsers, currentGroup } = this.store

    const userList = currentGroup ? currentGroup.userList : []
    const userRowSelection = {
      selectedRowKeys: R.pluck('userId', selectedUsers),
      onChange: this.handleUserSelect
    }

    return (
      <>
        {React.Children.map(this.props.children, (child) =>
          React.cloneElement(child, {
            onClick: () => this.openModal(group)
          })
        )}

        <Modal
          title={i18n('remove-permission-user', '移除用户')}
          visible={visible}
          onCancel={this.closeModal}
          size="large"
          className="permission-user-modal"
          onOk={this.submitModal}
        >
          <Table
            rowKey="userId"
            columns={userModalColumns}
            dataSource={toJS(userList)}
            rowSelection={userRowSelection}
            pagination={false}
            loadMore={currentGroup ? currentGroup.loadMoreRemoveUser : false}
            onLoadMore={this.getUserList}
          />
        </Modal>
      </>
    )
  }
}
