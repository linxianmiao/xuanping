import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { message, Modal, Menu, Icon } from '@uyun/components'
import './style/userMenu.less'
const MenuList = Menu.MenuList

@inject('store', 'userStore')
@observer
class UserMenu extends Component {
  componentDidMount () {
    this.props.store.getUserGroup()
  }

    onCreate = (value) => {
      this.props.store.onCreate({ groupName: value })
    }

    onSave = (id, value) => {
      if (value === '') {
        message.error(i18n('index_errorMsg1', '用户组名称长度必须在1~7之间'))
      } else {
        this.props.store.onSave(value, id)
      }
    }

    onDelete = id => {
      Modal.confirm({
        title: i18n('user_group_detele_msg', '您是否确认要删除该用户组？'),
        onOk: () => {
          this.props.store.onDelete(id)
        }
      })
    }

    onActivity = id => {
      this.props.store.onUserGroup(id)
    }

    render () {
      const { lists, active } = toJS(this.props.store)
      return (
        <MenuList
          editable
          showSearch
          title={i18n('user_group', '用户组')}
          searchPlaceholder={i18n('globe.keywords', '请输入关键字')}
          selectedKeys={[].concat(active)}
          onClick={(e) => {
            this.onActivity(e.key)
          }}
          onAdd={(e) => {
            e.domEvent.isPropagationStopped()
            this.onCreate(e.value)
          }}
          onEdit={(e) => {
            e.domEvent.isPropagationStopped()
            this.onSave(e.key, e.value)
          }}
          onDelete={(e) => {
            e.domEvent.isPropagationStopped()
            this.onDelete(e.key)
          }}>
          {_.map(lists, item => <Menu.Item editable key={item.groupId} title={item.groupName}>{item.groupName}</Menu.Item>)}
        </MenuList>
      )
    }
}

export default UserMenu
