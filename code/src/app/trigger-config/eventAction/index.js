// 事件触发下的动作
import React, { Component } from 'react'
import { Form, Tabs, Checkbox } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import SendEmail from './sendEmail'
import SendSMS from './sendSMS'
import SendSys from './sendSys'
import SendChatops from './sendChatops'
import SendWechat from './sendWechat'
import Restful from './restful'
import ConfigTicket from './configTicket'

const FormItem = Form.Item
const TabPane = Tabs.TabPane

const itemLayout = {
  wrapperCol: {
    span: 22,
    offset: 2
  }
}

const actionTypes = [
  {
    name: i18n('sendEmail-title', '发送邮件给用户'),
    type: 'sendEmail',
    Component: SendEmail
  },
  {
    name: i18n('sendSMS-title', '发送短信给用户'),
    type: 'sendSMS',
    Component: SendSMS
  },
  {
    name: i18n('sendSys-title', '发送站内信给用户'),
    type: 'sendSys',
    Component: SendSys
  },
  {
    name: i18n('sendChatops-title', '发送ChatOps消息'),
    type: 'sendChatops',
    Component: SendChatops
  },
  {
    name: i18n('sendWechat-title', '发送微信给用户'),
    type: 'sendWechat',
    Component: SendWechat
  },
  {
    name: i18n('restful-title', '调用Restful接口'),
    type: 'restful',
    Component: Restful
  },
  {
    name: i18n('configTicket-title', '设置工单'),
    type: 'configTicket',
    Component: ConfigTicket
  }
]
@inject('triggerStore')
@observer
export default class EventAction extends Component {
  renderTabs = () => {
    const { actionList, trigger } = this.props.triggerStore
    return actionList.map(action => {
      const { name, type, Component } = actionTypes.find(item => item.type === action.type)
      const data = trigger.actionList.find(item => item.type === action.type)
      // checkbox的disable和checked需要根据各自的表单数据来决定
      const tab = <span><Checkbox />&nbsp;&nbsp;{name}</span>
      return (
        <TabPane key={type} tab={tab}>
          <Component type={type} form={this.props.form} data={data} />
        </TabPane>
      )
    })
  }

  render() {
    return (
      <FormItem {...itemLayout}>
        <div>{i18n('trigger.action.message', '执行以下动作')}: </div>
        <Tabs type="card">
          {this.renderTabs()}
        </Tabs>
      </FormItem>
    )
  }
}
