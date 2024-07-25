import React, { Component } from 'react'
import { Form, Tag } from '@uyun/components'
import Users from '../../users'
import TicketUserStore from '../../stores/ticketUserStore'
const FormItem = Form.Item
class SeniorAdvancedUser extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: false,
      users: [],
      groups: []
    }
    this.ticketUserStore = new TicketUserStore()
  }

    handleOk = data => {
      this.setState({
        users: data['1'],
        groups: data['0'],
        visible: false
      }, () => { this.setInitValue() })
    }

    setInitValue = () => {
      const { item } = this.props
      const { users, groups } = this.state
      const initialValue = [].concat(users, groups)
      const dataSource = {}
      if (!_.isEmpty(users)) {
        dataSource.user = _.map(users, item => item.id)
      }
      if (!_.isEmpty(groups)) {
        dataSource.groups = _.map(groups, item => item.id)
      }
      this.props.setFieldsValue({ [item.code]: initialValue.length !== 0 ? dataSource : undefined })
    }

    handleCancel = e => {
      this.setState({
        visible: false
      })
    }

    handleSearch = data => {
      this.ticketUserStore.getList(_.assign({}, data, {
        ticketId: this.props.ticketId,
        modelId: this.props.modelId,
        flowId: this.props.flowId,
        handleType: this.props.handleType,
        tacheId: this.props.tacheId,
        caseId: this.props.caseId
      }), 'post')
    }

    showAddUser = () => {
      this.ticketUserStore.getList({
        type: '1',
        ticketId: this.props.ticketId,
        modelId: this.props.modelId,
        flowId: this.props.flowId,
        handleType: this.props.handleType,
        tacheId: this.props.tacheId,
        caseId: this.props.caseId
      }, 'post').then(() => {
        this.setState({
          visible: true,
          users: this.state.users,
          groups: this.state.groups
        }, () => { this.setInitValue() })
      })
    }

    closeUser = (id, e) => {
      e.stopPropagation()
      this.setState(prevState => {
        return {
          users: _.filter(prevState.users, item => item.id !== id)
        }
      }, () => { this.setInitValue() })
    }

    closeGroup = (id, e) => {
      e.stopPropagation()
      this.setState(prevState => {
        return {
          groups: _.filter(prevState.groups, item => item.id !== id)
        }
      }, () => { this.setInitValue() })
    }

    render () {
      const { item, getFieldDecorator } = this.props
      const { visible, users, groups } = this.state
      return (
        <FormItem label={item.showName === false ? '' : item.name}>
          {getFieldDecorator(item.code, {
            initialValue: undefined,
            rules: [{
              required: item.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${item.name}`
            }]
          })(
            <div className="tags-lists" onClick={this.showAddUser} placeholder={i18n('ticket.create.select_handler', '请选择处理人')}>
              { _.map(users, item => {
                return (
                  <Tag key={item.id} closable onClose={e => { this.closeUser(item.id, e) }}>
                    { item.name}
                  </Tag>
                )
              }) }
              { _.map(groups, item => {
                return (
                  <Tag key={item.id} closable onClose={e => { this.closeGroup(item.id, e) }}>
                    { item.name}
                  </Tag>
                )
              }) }
            </div>
          )
          }
          <Users
            url={API.queryActivityStaffList}
            TicketUserStore={this.ticketUserStore}
            visible={visible}
            handleOk={this.handleOk}
            handleCancel={this.handleCancel}
            handleSearch={this.handleSearch}
            defaultTab={'1'}
            selects={{
              1: users,
              0: groups
            }}
            isUseVariable
            isShowUserVariable
            tabs={['1', '0']} />
        </FormItem>
      )
    }
}
export default SeniorAdvancedUser
