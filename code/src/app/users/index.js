import React, { Component } from 'react'
import { RightOutlined, UserAddOutlined, UsergroupAddOutlined } from '@uyun/icons'
import { Modal, message } from '@uyun/components'
import QueueAnim from 'rc-queue-anim'
import UserSystem from './userSystem'

/**
 * 用户选择组件
 *
 * @class Users
 * @extends {Component}
 * @param visible       boolean   Modal的可见状态
 * @param status        object    { status1: 部门是否禁用 1（是）0（否）, status2: 组是否禁用 1（是）0（否）, status3: 人员是否禁用 1（是）0（否）}
 * @param choose        boolean   是否打开选择层，true的话status值由组件内部控制
 * @param selectedData  boolean   已选择的数据
 * @param opt           number    是否是单选 1（是）0（否）
 * @param assgin        number    是否要指定人员1（是）0（否）
 * @param onOk          function  确定按钮的回调，取得数据
 * @param onChange      function  取消按钮的回调
 */
class Users extends Component {
  state = {
    title: i18n('choose_user_and_group', '选择人员跟用户组'),
    type: ''
  }

  getStatus = () => {
    const type = this.state.type
    let status = {}
    let title = ''
    switch (type) {
      case 'userGroup':
        status = { status1: 1, status2: 0, status3: 1 }
        title = i18n('choose_group', '选择用户组')
        break
      case 'user':
        status = { status1: 1, status2: 1, status3: 0 }
        title = i18n('choose_user', '选择人员')
        break
      default:
        status = { status1: 1, status2: 0, status3: 0 }
        title = i18n('choose_user_and_group', '选择人员跟用户组')
    }
    return { status, title }
  }

  onClick = (type) => {
    if (this.props.reassign !== 1) {
      if (type === 'userGroup' && _.isEmpty(this.props.filterUser.groups)) {
        message.error(i18n('ticket.forms.btn.submit.no.usergroup', '无可选的用户组'))
        return false
      }
      if (type === 'user' && _.isEmpty(this.props.filterUser.users)) {
        message.error(i18n('ticket.forms.btn.submit.no.user', '无可选的用户'))
        return false
      }
    }

    if (this.props.cutrrenttype !== '' && this.props.cutrrenttype !== type) {
      this.props.clearUsers && this.props.clearUsers(type)
    }
    this.setState({ type })
  }

  onOk = (data) => {
    const onOk = this.props.onOk
    if (this.props.choose) {
      onOk && onOk(this.state.type, data)
    } else {
      onOk && onOk('user', data)
    }
  }

  render() {
    const { type } = this.state
    const { choose, visible, onOk, ...other } = this.props
    const { status, title } = this.getStatus('')
    let filterUser = []
    let isassignGroup = false
    if (type === 'userGroup') {
      filterUser = this.props.filterUser.groups || []
      isassignGroup = this.props.reassign
    } else if (type === 'user') {
      filterUser = this.props.filterUser.users
    } else {
      if (!this.props.choose) {
        filterUser = this.props.filterUser.users
      }
    }

    return (
      <Modal
        visible={visible}
        onCancel={this.props.onCancel}
        wrapClassName="user-select-component-modal"
        footer={false}
      >
        {choose ? (
          <div className="user-select-component-wrap">
            {type === '' && (
              <div className="user-select-choose">
                <div
                  className="user-select-choose-btn"
                  onClick={() => {
                    this.onClick('user')
                  }}
                >
                  <UserAddOutlined />
                  <span>{i18n('choose_user', '选择人员')}</span>
                  <RightOutlined />
                </div>
                <div
                  className="user-select-choose-btn"
                  onClick={() => {
                    this.onClick('userGroup')
                  }}
                >
                  <UsergroupAddOutlined />
                  <span>{i18n('choose_group', '选择用户组')}</span>
                  <RightOutlined />
                </div>
              </div>
            )}
            <QueueAnim className="user-select-side-wrap">
              {type !== '' && (
                <UserSystem
                  key="user"
                  type={type}
                  title={title}
                  {...other}
                  status={status}
                  onOk={this.onOk}
                  isassignGroup={isassignGroup}
                  filterUser={_.cloneDeep(filterUser)}
                />
              )}
            </QueueAnim>
          </div>
        ) : (
          <UserSystem
            key="userGroup"
            title={title}
            status={{ status1: 1, status2: 1, status3: 1 }}
            {...other}
            onOk={this.onOk}
            filterUser={_.cloneDeep(filterUser)}
          />
        )}
      </Modal>
    )
  }
}

export default Users
