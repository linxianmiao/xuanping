import React, { Component } from 'react'
import { Button, Input, Modal, message } from '@uyun/components'
import { autorun, toJS } from 'mobx'

import { inject, observer } from 'mobx-react'
import './style/userManage.less'
import UserTable from './userTable'
import AddUserModal from './addUserModal'

@inject('store')
@observer
class UserManage extends Component {
    state = {
      visible: false,
      selectedRowKeys: []
    }

    componentDidMount () {
      this.disposer = autorun(() => {
        const { wd, pageNum, pageSize, active } = this.props.store
        const data = { pageNum, pageSize, wd, groupId: active }
        active !== '' && this.props.store.getUserByGroupId(data)
      })
    }

    onOpen = () => {
      this.setState({ visible: true })
    }

    onClose = () => {
      this.setState({ visible: false })
    }

    onOk = () => {
      this.setState({ visible: false }, () => {
        this.props.store.refresh()
      })
    }

    onChangePage = page => {
      this.props.store.setPage(page)
    }

    onChangeWd = e => {
      this.props.store.setWd(e.target.value)
    }

    onSelectChange = selectedRowKeys => {
      this.setState({ selectedRowKeys })
    }

    onRemove = id => {
      const data = {
        groupId: this.props.store.active,
        userId: id
      }
      Modal.confirm({
        content: i18n('user_remove_msg', '您是否确认要移除该用户？'),
        okText: i18n('globe.ok', '确定'),
        cancelText: i18n('cancel', '取消'),
        onOk: () => {
          this.props.store.removeUser(data)
        }
      })
    }

    onMultiRemoveUser = () => {
      const userIds = this.state.selectedRowKeys
      if (userIds.length > 0) {
        const data = {
          groupId: this.props.store.active,
          userIds
        }
        Modal.confirm({
          content: i18n('user_remove_msg', '您是否确认要移除该用户？'),
          okText: i18n('globe.ok', '确定'),
          cancelText: i18n('cancel', '取消'),
          onOk: () => {
            this.props.store.multiRemoverUser(data)
          }
        })
      } else {
        message.error(i18n('pls_select_users', '请先选择用户'))
      }
    }

    componentWillUnmount () {
      this.disposer()
    }

    render () {
      const { users, loading, pageNum } = toJS(this.props.store)
      const { visible } = this.state
      return (
        <div className="user-group-manage">
          <div className="user-group-manage-header">
            <Button type="primary" onClick={this.onOpen}>{i18n('add_user', '添加用户')}</Button>
            <Button type="primary" onClick={this.onMultiRemoveUser}>{i18n('multi_remove', '批量移除')}</Button>
            <Input prefix={<i className="iconfont icon-sousuo" />}
              key={this.props.store.active}
              placeholder={i18n('input_keyword', '请输入关键字')}
              onChange={this.onChangeWd} />
          </div>
          <div className="user-group-manage-body">
            <UserTable data={users}
              loading={loading}
              changePage={this.onChangePage}
              current={pageNum}
              onDelete={this.onRemove}
              onChange={this.onSelectChange}
            />
          </div>
          { visible &&
          <AddUserModal
            onCancel={this.onClose}
            onOk={this.onOk}
            visible={visible}
          />
          }
        </div>
      )
    }
}

export default UserManage
