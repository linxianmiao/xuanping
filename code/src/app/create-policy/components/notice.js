import React, { Component } from 'react'
import { toJS, action } from 'mobx'
import { Tabs, Checkbox, Form, message, Select } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import Ticket from '../../trigger/component/triggerRule/ticket'
import AddVar from '../../trigger/component/triggerRule/addVar'
import User from '../../trigger/component/triggerRule/user'
import Headers from '../../TriggerEdit2/components/Actions/Widgets/Headers'
import Body from '../../TriggerEdit2/components/Actions/Widgets/Body'
import defaultActions from '../config/actions'
const FormItem = Form.Item
const TabPane = Tabs.TabPane

@inject('triggerStore')
@observer
class Notice extends Component {
    state = {
      activeKey: 'sendEmail'
    }

    // 调用之前写的组件，当type = true ， paramIndex就没有用了 （....）
    setTriggerData = (triggerIndex, paramIndex, value, type) => {
      // 赞不支持用户组
      if (type === 'staff') {
        return false
      }
      const { item, index } = this.props
      const { actionCode, type: actionType } = triggerIndex || {}
      let actions = item.actions || []

      if (_.some(actions, action => actionCode ? action.actionCode === actionCode : action.type === actionType)) {
        actions = _.map(toJS(actions), action => {
          if (
            (actionCode && action.actionCode === actionCode) ||
              (!actionCode && action.type === actionType)
          ) {
            if (type) {
              const configTicket = _.map(value, ticket => ({ paramName: ticket.code, paramValue: ticket.value }))
              return _.assign({}, action, { configTicket })
            } else {
              return _.assign({}, action, { [paramIndex]: value })
            }
          }
          return action
        })
      } else {
        actions = [...actions, {
          [paramIndex]: value,
          type: actionType,
          actionCode,
          useable: 0
        }]
      }
      this.props.handleChange(_.assign({}, item, { actions }), index)
    }

    // 删除通知状态
    handleDel = () => {
      const { item, index } = this.props
      const types = _.filter(item.types, type => type !== '2') || []
      this.props.handleChange(_.assign({}, item, { actions: defaultActions, types }), index)
    }

    renderTabHeader = (actionType) => {
      const { type, name, actionCode } = actionType
      const { item } = this.props
      const actions = item.actions || []
      const action = _.find(actions, action => actionCode ? action.actionCode === actionCode : action.type === type) || {}
      const { useable } = action
      return (
        <React.Fragment>
          <Checkbox
            style={{ verticalAlign: 'middle' }}
            checked={useable === 1}
            onClick={e => { e.stopPropagation() }}
            onChange={(e) => { this.handleChangeUseable(actionType, action, e.target.checked) }} />
          <span style={{ paddingLeft: 5 }}>{name}</span>
        </React.Fragment>

      )
    }

    // 改变checkbox的弹框，过去checked === true的时候需要进行校验
    handleChangeUseable = (actionType, action, checked) => {
      const { type, actionCode } = actionType
      const { title, content, acceptor, configTicket, url, requestType } = action
      const useable = checked ? 1 : 0
      if (useable) {
        if (type === 'sendEmail' && title && content && !_.isEmpty(acceptor)) {
          this.setTriggerData(actionType, 'useable', useable)
        } else if (type === 'configTicket') {
          const falt = _.every(configTicket, ticket => Boolean(ticket.paramValue && ticket.paramName))
          if (falt) {
            this.setTriggerData(actionType, 'useable', useable)
          } else {
            message.error('请完善信息')
          }
        } else if (type === 'restful') {
          if (!requestType || !url) {
            message.error('请完善信息')
          } else {
            this.setTriggerData(actionType, 'useable', useable)
          }
        } else if (content && !_.isEmpty(acceptor)) {
          this.setTriggerData(actionType, 'useable', useable)
        } else {
          message.error('请完善信息')
        }
      } else {
        this.setTriggerData(actionType, 'useable', useable)
      }
    }

    renderContent = (actionType, record, data, dilver) => {
      const { type, options } = record
      const { url, headers, formData, raw, requestType } = data
      let triggerIndex = { type: actionType }
      switch (type) {
        case 'select':
          return (
            <Select value={requestType} onChange={value => this.setTriggerData(triggerIndex, 'requestType', value)}>
              {
                options.map(item => <Select.Option key={item.value}>{item.name}</Select.Option>)
              }
            </Select>
          )
        case 'text':
          return (
            <AddVar
              {...dilver}
              paramIndex="url"
              type="input"
              triggerIndex={triggerIndex}
              item={{ value: url }}
            />
          )
        case 'mapList':
          return (
            <Headers
              value={headers || []}
              onChange={value => this.setTriggerData(triggerIndex, 'headers', value)}
            />
          )
        case 'tabs':
          return (
            <Body
              formData={formData || {}}
              raw={raw || {}}
              fullParams = {this.props.triggerStore.fullParams}
              onChange={value => {
                this.setTriggerData(triggerIndex, 'formData', value.formData)
                this.setTriggerData(triggerIndex, 'raw', value.raw)
              }}
            />
          )
        default:
          return null
      }
    }

    renderTabPane = (actionType, dilver) => {
      const { type, executeParamPos: list, actionCode } = actionType
      const { formItemLayout, item } = this.props
      const { actions = [] } = item
      const data = _.find(actions, item => actionCode ? item.actionCode === actionCode : item.type === type) || {}
      const { title, content, acceptor, configTicket } = data
      const executeParamPos = _.map(configTicket, ticket => ({ code: ticket.paramName, value: ticket.paramValue }))
      if (type === 'configTicket') {
        return (
          <div className="trigger-actionTypes-item-wrap">
            <FormItem {...formItemLayout} label={i18n('trigger.actions.configTicket.set', '设置')} required>
              <Ticket {...dilver} trigger={{ executeParamPos }} triggerIndex={{ type: 'configTicket' }} paramIndex="configTicket" />
            </FormItem>
          </div>
        )
      } else if (type === 'restful') {
        return (
          <div className="trigger-actionTypes-item-wrap">
            {
            _.map(list, item => {
              const { text, required } = item
              return <FormItem
                      {...formItemLayout}
                      label={text}
                      required={!!required}>
                      {this.renderContent(actionType = type, item, data, dilver)}
                    </FormItem>
              })
            }
          </div>
        )
      } else {
        return (
          <div className="trigger-actionTypes-item-wrap">
            { _.map(list, (item) => {
              const { type: itemType, code, name } = item
              if (itemType === 1) {
                return (
                  <FormItem required key={code} {...formItemLayout} label={name}>
                    <AddVar {...dilver} item={{ value: title }} triggerIndex={{ actionCode, type }} paramIndex="title" type="input" />
                  </FormItem>
                )
              } else if (itemType === 2) {
                return (
                  <FormItem required key={code} {...formItemLayout} label={name}>
                    <User {...dilver} item={{ value: acceptor }} triggerIndex={{ actionCode, type }} paramIndex="acceptor" />
                  </FormItem>
                )
              } else if (itemType === 3) {
                return (
                  <FormItem required key={code} {...formItemLayout} label={name}>
                    <AddVar {...dilver} item={{ value: content }} triggerIndex={{ actionCode, type }} paramIndex="content" type="textarea" />
                  </FormItem>
                )
              }
            })}
          </div>
        )
      }
    }

    handleChangeTabs = (activeKey) => {
      this.setState({ activeKey })
    }

    render () {
      const { triggerNode } = this.props
      const { actionTypes } = this.props.triggerStore
      const { activeKey } = this.state
      const dilver = {
        ..._.pick(
          this.props.triggerStore,
          [
            'titleParams',
            'fullParams',
            'builtinParams',
            'defineParams',
            'ticketParams',
            'fieldUsers',
            'variableUsers'
          ]
        ),
        triggerNode,
        store: this.props.triggerStore,
        setTriggerData: this.setTriggerData
      }
      return (
        <div className="sla-policy-action-wrap">
          <Tabs type="card" onChange={this.handleChangeTabs}>
            {
              _.chain(actionTypes)
                .filter(item => item.type !== 'script')
                .map(item => {
                  return (
                    <TabPane tab={this.renderTabHeader(item)} key={item.actionCode || item.type}>
                      {this.renderTabPane(item, dilver)}
                    </TabPane>
                  )
                })
                .value()
            }
          </Tabs>
          <i onClick={this.handleDel} className="iconfont icon-shanchu" />
        </div>
      )
    }
}

export default Notice
