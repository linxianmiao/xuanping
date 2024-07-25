import React, { Component } from 'react'
import { inject } from 'mobx-react'
import { Tag, Modal } from '@uyun/components'
import { UserSystem } from '../../index'
@inject('userStore')
class User extends Component {
    state = {
      visible: false
    }

    closeUser = (id, e) => {
      e.stopPropagation()
      this.props.onChangeCondition(_.filter(this.props.value, item => item !== id))
    }

    showAddUser = () => { this.setState({ visible: true }) }

    addUserOk = data => {
      this.setState({
        visible: false
      })
      this.props.onChangeCondition(_.map(data, item => item.userId))
    }

    addUserCancel = () => {
      this.setState({
        visible: false
      })
    }

    render () {
      const { visible } = this.state
      const { userList } = this.props.userStore
      const { value } = this.props
      const diliver = {
        status: { status1: 1, status2: 1, status3: 0 },
        opt: 0
      }
      const chexkedUserList = _.filter(userList, user => _.includes(value, user.userId))
      return (
        <div className="rule-cond-select item-value user-select" style={this.props.style ? { width: 200, marginTop: 0 } : null}>
          <div id="tags-lists" className="tags-lists" onClick={this.showAddUser} placeholder={i18n('ticket.create.select_handler', '请选择处理人')}>
            {_.map(chexkedUserList, (item, index) => {
              return (
                <div style={{ display: 'inline' }} key={index}>
                  <Tag key={item.userId} closable onClose={e => { this.closeUser(item.userId, e) }}>
                    { item.userName ? item.userName : item.username }
                  </Tag>
                </div>
              )
            })}
          </div>
          {visible &&
          <Modal
            className="mymodelstyle"
            visible={visible}
            maskClosable={false}
            onOk={this.addUserOk}
            onCancel={this.addUserCancel}
            width={620}
            footer={''}>
            <UserSystem
              {...diliver}
              assign={1}
              onCancel={this.addUserCancel}
              onOk={this.addUserOk}
              selectedData={chexkedUserList} />
          </Modal>}
        </div>
      )
    }
}
export default User
