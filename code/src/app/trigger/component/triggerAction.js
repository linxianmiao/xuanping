import React, { Component } from 'react'
import { PlusOutlined } from '@uyun/icons'
import { Tabs, Menu, Dropdown, Button, Icon } from '@uyun/components'
import TriggerClass from './triggerRule/triggerClass'
import Ticket from './triggerRule/ticket'
import TicketAction from './triggerRule/TicketAction'
import MessageNotify from './triggerRule/MessageNotify'
import '../style/triggerAction.less'
const TabPane = Tabs.TabPane

const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 20 }
}

// 动作的type和actionCode一起作为key
function getKey(data) {
  return data.type + data.actionCode
}

class TriggerAction extends Component {
  constructor(props) {
    super(props)
    const triggers = this.props.triggers || []
    this.state = {
      triggers: triggers,
      activeKey: triggers.length ? getKey(triggers[0]) : '',
      actionTypes: JSON.parse(JSON.stringify(props.actionTypes))
    }
  }

  static defaultProps = {
    source: '', // 所属字段，比如'olaStrategy'表示逾期策略
    incidents: [] // 当前选中的触发事件
  }

  onChange = (activeKey) => {
    this.setState({ activeKey })
  }

  onEdit = (targetKey, action) => {
    this[action](targetKey)
  }

  remove = (targetKey) => {
    let activeKey = this.state.activeKey
    let lastIndex
    this.state.triggers.forEach((trigger, i) => {
      if (trigger.key === targetKey) {
        lastIndex = i - 1
      }
    })
    const triggers = this.state.triggers.filter((trigger) => getKey(trigger) !== targetKey)
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = getKey(triggers[lastIndex])
    }
    this.setState({ triggers, activeKey })
    this.props.setTriggerData && this.props.setTriggerData(this.props.triggerIndex, triggers)
  }

  handleMenuClick = (e) => {
    const { triggers } = this.state
    const { actionTypes } = this.props
    let item = {}
    actionTypes.map((action) => {
      if (getKey(action) === e.key) {
        item = JSON.parse(JSON.stringify(action))
      }
    })

    if (item.type === 'setColor') {
      // 如果动作是颜色，初始化#ec4e53
      item.executeParamPos[0].value = '#ec4e53'
    }

    triggers.push(item)
    this.setState({ triggers, activeKey: getKey(item) })
    this.props.setTriggerData && this.props.setTriggerData(this.props.triggerIndex, triggers)
  }

  setTriggerData = (triggerIndex, paramIndex, value, flag) => {
    const { triggers } = this.state
    if (flag) {
      if (flag === 'staff') {
        // 为了兼容人员用户组
        triggers[triggerIndex].executeParamPos[paramIndex].staffs = value
      } else {
        triggers[triggerIndex].executeParamPos = value
      }
    } else {
      triggers[triggerIndex].executeParamPos[paramIndex].value = value
    }
    this.setState({
      triggers
    })
    this.props.setTriggerData && this.props.setTriggerData(triggerIndex, triggers)
  }

  renderTabPaneContent(trigger, index) {
    const {
      source,
      modelId,
      incidents,
      fieldsData,
      departList,
      fieldUsers,
      variableUsers,
      store,
      links
    } = this.props
    const { titleParams, fullParams, builtinParams, defineParams, ticketParams } = fieldsData
    const diliver = {
      source,
      modelId,
      incidents,
      formItemLayout,
      trigger,
      store,
      titleParams,
      fullParams,
      builtinParams,
      defineParams,
      ticketParams,
      departList,
      fieldUsers,
      variableUsers,
      triggerIndex: index,
      setTriggerData: this.setTriggerData
    }

    switch (trigger.type) {
      case 'configTicket':
        return <Ticket {...diliver} key={getKey(trigger)} />
      case 'closeTicket':
      case 'rollbackTicket':
        return <TicketAction trigger={trigger} />
      case 'messageNotify':
        return (
          <MessageNotify
            trigger={trigger}
            triggerIndex={index}
            setTriggerData={this.setTriggerData}
          />
        )
      default:
        return <TriggerClass {...diliver} key={getKey(trigger)} links={links} />
    }
  }

  render() {
    const { triggers, activeKey } = this.state
    const { actionTypes } = this.props
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        {actionTypes.map((action) => {
          let flag = false
          triggers.map((trigger) => {
            if (getKey(trigger) === getKey(action)) {
              flag = true
            }
          })
          return (
            <Menu.Item disabled={flag} key={getKey(action)}>
              {action.name}
            </Menu.Item>
          )
        })}
      </Menu>
    )
    const operations = (
      <Dropdown overlay={menu}>
        <Button>
          <PlusOutlined />
          {i18n('add_action', '添加动作')}
        </Button>
      </Dropdown>
    )
    return (
      <div className="trigger-action-wrap">
        <Tabs
          hideAdd
          tabBarExtraContent={operations}
          onChange={this.onChange}
          activeKey={activeKey}
          type="editable-card"
          onEdit={this.onEdit}
        >
          {triggers.map((trigger, index) => {
            return (
              <TabPane tab={trigger.name} key={getKey(trigger)}>
                {this.renderTabPaneContent(trigger, index)}
              </TabPane>
            )
          })}
        </Tabs>
      </div>
    )
  }
}

export default TriggerAction
