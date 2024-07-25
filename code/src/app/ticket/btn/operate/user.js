import React, { Component } from 'react'
import { Form, Tag, message } from '@uyun/components'
import UserSystem from '../../../users'
import './styles/user.less'
const FormItem = Form.Item

class User extends Component {
    state = {
      userModal: false,
      chexkedUserList: [],
      initialValue: []
    }

    componentDidMount () {
      this.type = ''
    }

    closeUser = (id, e) => {
      const { item } = this.props
      e.stopPropagation()
      const { initialValue, chexkedUserList } = this.state
      const fliterData = initialValue.filter(item => item !== id)
      const newchexkedUserList = chexkedUserList.filter(item => {
        if (this.type === 'user' && id !== item.userId) {
          return item
        }
        if (this.type === 'userGroup' && id !== item.groupId) {
          return item
        }
      })
      this.props.setFieldsValue({ [item.code]: fliterData.length !== 0 ? fliterData : undefined })
      this.setUser(this.type, fliterData)
      this.setState({
        initialValue: fliterData,
        chexkedUserList: newchexkedUserList || []
      })
    }

    showAddUser = () => {
      const { item } = this.props
      if (_.isEmpty(item.users) || item.users.length === 0) {
        message.warning(i18n('config.user.noUser', '没有选择的人员'))
        return false
      }
      this.setState({
        userModal: true
      })
    }

    addUserCancel = () => {
      this.setState({
        userModal: false
      })
    }

    setUser = (type, initialValue) => {
      const { item } = this.props
      this.props.setFlowUser && this.props.setFlowUser(item, type, initialValue)
      this.type = type
    }

    addUserOk = (type, data) => {
      const { item } = this.props
      let initialValue = []
      if (type === 'user') {
        initialValue = data.map(item => item.userId)
      } else if (type === 'userGroup') {
        if (data.length > 1) {
          message.warning(i18n('config.user.toGroup', '不能选择多个组'))
          return false
        }
        initialValue = data.map(item => item.groupId)
      } else {
        initialValue = data.map(item => item.userId)
      }
      this.props.setFieldsValue({ [item.code]: initialValue.length !== 0 ? initialValue : undefined })
      this.setUser(type, initialValue)
      this.setState({
        initialValue,
        userModal: false,
        chexkedUserList: data
      })
    }

    clearUsers = () => {
      const { item } = this.props
      this.setUser(this.type, undefined)
      this.props.setFieldsValue({ [item.code]: undefined })
      this.setState({ chexkedUserList: [] })
    }

    render () {
      const { item, getFieldDecorator, formItemLayout } = this.props
      const { initialValue, chexkedUserList } = this.state
      const choose = (`${this.props.item.users.isCountersign}` === '0' && (item.users && item.users.groups))
      return (
        <FormItem {...formItemLayout} label={item.showName === false ? null : item.name}>
          {getFieldDecorator(item.code, {
            initialValue: initialValue,
            rules: [{
              required: item.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${item.name}`
            }]
          })(
            <div className="tags-lists" onClick={this.showAddUser} placeholder={i18n('ticket.create.select_handler', '请选择处理人')}>
              {_.map(chexkedUserList, item => {
                let id
                if (this.type === 'user') {
                  id = item.userId
                } else {
                  id = item.groupId
                }
                return (
                  <Tag key={id} closable onClose={e => { this.closeUser(id, e) }}>
                    { item.userName ? item.userName : ''}
                    { item.realname ? item.realname : ''}
                    { item.groupName ? item.groupName : ''}
                  </Tag>
                )
              })}
            </div>
          )
          }
          {
            this.state.userModal &&
            <UserSystem
              choose={choose}
              visible={this.state.userModal}
              selectedData={_.cloneDeep(chexkedUserList)}
              onOk={this.addUserOk}
              onCancel={this.addUserCancel}
              filterUser={this.props.item.users}
              title={item.name}
              opt={this.props.opt || 0}
              reassign={this.props.reassign || 0}
              assign={1}
              orgId={this.props.orgId}
              filterRule={'' + this.props.filterRule ? this.props.filterRule : null}
              isCountersign={this.props.item.users.isCountersign}
              clearUsers={this.clearUsers}
              cutrrenttype={this.type}
              status={{ status1: 1, status2: 1, status3: 0 }}
            />
          }
        </FormItem>
      )
    }
}
export default User
