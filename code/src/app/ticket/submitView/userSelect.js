import React, { Component } from 'react'
import { Tag } from '@uyun/components'
import Users from '~/ticket/users'
import TicketUserStore from '~/ticket/stores/ticketUserStore'

export default class UserSelect extends Component {
  constructor (props) {
    super(props)
    this.ticketUserStore = new TicketUserStore()
    this.state = {
      visible: false,
      users: [],
      groups: []
    }
  }

  get postData() {
    const { ticketId, modelId, flowId, code: tacheId, caseId, currrentForms: form, handleType } = this.props
    return { ticketId, modelId, flowId, handleType, tacheId, caseId, form }
  }

  handleOk = data => {
    this.setState({
      users: data['1'],
      groups: data['0'],
      visible: false
    }, () => {
      this.setInitValue()
    })
  }

  setInitValue = () => {
    const { code } = this.props
    const { users, groups } = this.state
    const value = {
      user: _.map(users, item => item.id),
      group: _.map(groups, item => item.id)
    }
    this.props.setFieldsValue({ [code]: value })
  }

  handleCancel = e => {
    this.setState({
      visible: false
    })
  }

  handleSearch = data => {
    this.ticketUserStore.getList(_.assign({}, data, this.postData), 'post')
  }

  showAddUser = async () => {
    const data = _.assign({}, this.postData, { type: '1' })
    await this.ticketUserStore.getList(data, 'post')
    this.setState({
      visible: true
    })
  }

  closeUser = (id, e) => {
    e.stopPropagation()
    this.setState(prevState => {
      return {
        users: _.filter(prevState.users, item => item.id !== id)
      }
    }, () => {
      this.setInitValue()
    })
  }

  closeGroup = (id, e) => {
    e.stopPropagation()
    this.setState(prevState => {
      return {
        groups: _.filter(prevState.groups, item => item.id !== id)
      }
    }, () => {
      this.setInitValue()
    })
  }

  render () {
    const { visible, users, groups } = this.state
    return (
      <div>
        <div className="tags-lists" onClick={this.showAddUser} placeholder={i18n('ticket.create.select_handler', '请选择处理人')}>
          {_.map(users, item => {
            return (
              <Tag key={item.id} closable onClose={e => { this.closeUser(item.id, e) }}>
                { item.name}
              </Tag>
            )
          })}
          {_.map(groups, item => {
            return (
              <Tag key={item.id} closable onClose={e => { this.closeGroup(item.id, e) }}>
                { item.name}
              </Tag>
            )
          })}
        </div>
        <Users
          url={API.queryActivityStaffList}
          TicketUserStore={this.ticketUserStore}
          visible={visible}
          handleOk={this.handleOk}
          handleCancel={this.handleCancel}
          handleSearch={this.handleSearch}
          selectsType={{
            1: this.props.handleType === 'reassign' ? 'radio' : 'checkbox',
            0: this.props.handleType === 'reassign' ? 'radio' : 'checkbox'
          }}
          defaultTab={'1'}
          selects={{
            1: users,
            0: groups
          }}
          isUseVariable
          isShowUserVariable
          tabs={['1', '0']} />
      </div>
    )
  }
}
