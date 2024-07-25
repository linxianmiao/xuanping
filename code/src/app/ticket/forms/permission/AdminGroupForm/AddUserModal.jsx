import React, { Component } from 'react'
import { Modal, Table, Input } from '@uyun/components'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { userModalColumns } from '../logic'
import * as R from 'ramda'

const Search = Input.Search

@observer
export default class AddUserModal extends Component {
  state = {
    visible: false,
    selectedRowKeys: []
  }

  get store() {
    return this.props.store
  }

  openModal = async (group) => {
    this.setState({ visible: true })
    this.store.setProps({
      pageIndex: 1,
      userKeyword: '',
      currentPanel: group
    })
    const res = await this.store.listGroupAddableUser(false)
    this.setState({ selectedRowKeys: R.pluck('userId', res || []) })
  }

  closeModal = () => {
    this.setState({ visible: false }, () => {
      this.store.setProps({
        addableUserList: [],
        selectedUsers: [],
        currentPanel: null
      })
    })
  }

  submitModal = () => {
    const { addableUserList, selectedUsers } = this.store
    const addableUserIds = R.pluck('userId', addableUserList)
    const remainSelectedUsers = this.store.currentPanel.relatedUsers
      .filter((user) => !addableUserIds.includes(user.userId))
      .filter((user) => !selectedUsers.find((item) => item.userId === user.userId))
    this.store.currentPanel.relatedUsers = [...selectedUsers, ...remainSelectedUsers]
    this.closeModal()
  }

  handleLoadMore = () => {
    this.store.setProps({
      pageIndex: this.store.pageIndex + 1
    })
    this.store.listGroupAddableUser()
  }

  debounceListGroupAddableUser = _.debounce(this.store.listGroupAddableUser, 500)

  handleUserKeywordChange = (e) => {
    this.store.setProps({
      pageIndex: 1,
      userKeyword: e.target.value
    })
    this.debounceListGroupAddableUser(false)
  }

  handleUserSelect = (keys, rows) => {
    this.setState({ selectedRowKeys: keys })
    this.store.setProps({ selectedUsers: rows })
  }

  render() {
    const { visible } = this.state
    const { group } = this.props
    const { userKeyword, loadMore, loading, addableUserList, selectedUsers } = this.props.store
    const userRowSelection = {
      //   selectedRowKeys: R.pluck('userId', selectedUsers),
      selectedRowKeys: this.state.selectedRowKeys,
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
          title={i18n('add-permission-user', '添加用户')}
          visible={visible}
          onCancel={this.closeModal}
          size="large"
          className="permission-user-modal"
          onOk={this.submitModal}
        >
          <Search
            value={userKeyword}
            onChange={this.handleUserKeywordChange}
            className="permission-user-modal-input"
            allowClear
            placeholder={i18n('input-keyword', '请输入关键字')}
          />
          <Table
            rowKey="userId"
            columns={userModalColumns}
            dataSource={toJS(addableUserList)}
            scroll={{ y: 400 }}
            loadMore={loadMore}
            onLoadMore={this.handleLoadMore}
            loading={loading}
            rowSelection={userRowSelection}
          />
        </Modal>
      </>
    )
  }
}
