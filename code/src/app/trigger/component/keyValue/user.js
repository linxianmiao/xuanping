import React, { Component } from 'react'
import { Tooltip, Tag, Modal } from '@uyun/components'
import UserSystem from '../../../users/userSystem'

class User extends Component {
  constructor (props) {
    super(props)
    const chexkedUserListId = this.props.initialValue || []
    const userList = props.userList
    const chexkedUserList = userList.filter(item => chexkedUserListId.includes(item.userId)) // 当前选中的用户

    this.state = {
      visible: false, // 用户选择组件的显示隐藏
      user: {}, // 用户信息
      chexkedUserList: chexkedUserList
    }
  }

  // 显示用户组件弹框
    showAddUser = () => {
      if (this.props.disabled) return false
      this.setState({ visible: true })
    }

    // 用户组件弹窗取消
    addUserCancel = () => {
      this.setState({ visible: false })
    }

    // 添加用户
    addUserOk = list => {
      const chexkedUserList = list.map(item => item.userId)
      this.setState({
        visible: false,
        chexkedUserList: list
      })
      this.props.onChangeCondition && this.props.onChangeCondition(chexkedUserList)
    }

    // 删除当前选中的用户
    closeUser = (id, e) => {
      e.stopPropagation()
      const oldVal = this.props.value
      const newVal = oldVal.filter(item => item !== id)
      const newChexkedUserList = this.state.chexkedUserList.filter(item => item.userId !== id)
      this.props.onChangeCondition && this.props.onChangeCondition(newVal)
      this.setState({
        chexkedUserList: newChexkedUserList
      })
    }

    // 展示用户信息详情
    handleMouseEnter = id => {
      axios.get(API.GET_USER_BY_ID(id)).then(res => {
        this.setState({ user: res })
      })
    }

    render () {
      const { user, visible, chexkedUserList } = this.state
      const diliver = { status: { status1: 1, status2: 0, status3: 0 }, opt: 0 }

      return (
        <div>
          <div className="tags-lists" onClick={() => this.showAddUser()} placeholder={i18n('ticket.create.select_handler', '请选择处理人')}>
            {
              chexkedUserList.map(item => {
                const title = (
                  <div>
                    <p style={{ marginRight: '20px' }}>{user.userName}</p>
                    {user.mobile && <p style={{ marginRight: '20px' }}>{user.mobile}</p>}
                    <p>{user.userEmail}</p>
                  </div>
                )
                return (
                  <span
                    key={item.userId}
                    onMouseEnter={() => { this.handleMouseEnter(item.userId) }}>
                    <Tooltip title={title}>
                      <Tag
                        onClose={e => { this.closeUser(item.userId, e) }} >
                        { item.userName ? item.userName : item.username }
                      </Tag>
                    </Tooltip>
                  </span>
                )
              })
            }
          </div>
          <Modal
            visible={visible}
            onCancel={this.addUserCancel}
            width={620}
            footer={''}
            className="mymodelstyle smallModal">
            <UserSystem
              onCancel={this.addUserCancel}
              onOk={this.addUserOk}
              title={i18n('add_user', '添加用户')}
              selectedData={chexkedUserList}
              {...diliver} />
          </Modal>
        </div>
      )
    }
}

export default User
