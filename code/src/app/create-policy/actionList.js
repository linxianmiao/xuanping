import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { PlusOutlined } from '@uyun/icons';
import { Row, Button, Col, Collapse, Menu, Dropdown, Modal } from '@uyun/components'
import ActionItem from './actionItem'
import defaultActions from './config/actions'
import { timeList } from '../create-definition/config'

@inject('policyStore', 'triggerStore')
@observer
class ActionList extends Component {
    state = {
      activeKey: ['0']
    }

    componentDidMount() {
      this.props.triggerStore.getFieldParams()
      this.props.triggerStore.getActionTypes({}, 'policy')
    }

    // 增加策略项
    addPolicy = (e) => {
      const item = {
        strategyType: e.key,
        timeDifference: 0,
        timeDifferenceUnit: 'MINUTES',
        types: [],
        color: e.key === '-1' ? '#2db7f5' : '#ec4e53',
        actions: defaultActions
      }
      this.handleChange(item)
    }

    // 删除升级策略的时候进行提示
    handleDel = (item, index) => {
      Modal.confirm({
        title: '您确认要删除该升级策略？',
        onOk: () => {
          this.handleChange(item, index)
        }
      })
    }

    // 改变升级策略，如果index为undefined的时候代表新增加一个策略，如果item不存在，index存在的话，代表删除一个策略，都存在的换则为修改策略值
    handleChange = (item, index) => {
      const { actions } = toJS(this.props.policyStore)
      const { activeKey } = this.state
      if (typeof index === 'undefined') {
        index = actions.length
        // 新增策略的时候自动展开
        this.setState({ activeKey: [...activeKey, `${index}`] })
      }
      if (item) {
        this.props.policyStore.actions = [...actions.slice(0, index), item, ...actions.slice(index + 1)]
      } else {
        this.props.policyStore.actions = [...actions.slice(0, index), ...actions.slice(index + 1)]
      }
      this.props.onValuesChange && this.props.onValuesChange(true)
    }

    renderHeader = (item) => {
      const { strategyType, timeDifferenceUnit, timeDifference = 0 } = item
      const times = _.find(timeList, time => time.value === timeDifferenceUnit) || {}
      switch (String(strategyType)) {
        case '-1' : return i18n('sla-policy-advance', '提前') + timeDifference + times.label
        case '0' : return i18n('sla-policy-on-time', '到达约定时间时')
        case '1':return i18n('sla-policy-overtime', '超时') + timeDifference + times.label
      }
    }

    handleChangeActiveKey = activeKey => {
      this.setState({ activeKey })
    }

    render () {
      const { actions } = this.props.policyStore
      const { formItemLayout, triggerNode } = this.props
      const { activeKey } = this.state
      const menu = (
        <Menu onClick={this.addPolicy}>
          <Menu.Item key="-1">{i18n('sla-policy-advance', '提前')}</Menu.Item>
          <Menu.Item key="1">{i18n('sla-policy-overtime', '超时')}</Menu.Item>
        </Menu>
      )
      return (
        <Row className="sla-policy-actions">
          <Col offset={2} span={22}>
            <Collapse onChange={this.handleChangeActiveKey} activeKey={activeKey}>
              {_.map(actions, (item, index) => {
                return (
                  <Collapse.Card
                    key={`${index}`}
                    header={this.renderHeader(item)}
                    extra={Boolean(index) && <i className="iconfont icon-shanchu" onClick={() => {
                      this.handleDel(null, index)
                    }} />}>
                    <ActionItem
                      item={item}
                      index={index}
                      triggerNode={triggerNode}
                      formItemLayout={formItemLayout}
                      onChange={this.handleChange} />
                  </Collapse.Card>
                )
              })}
            </Collapse>
          </Col>
          <Col offset={2} span={22}>
            <Dropdown overlay={menu}>
              <Button style={{ width: 156, margin: '30px 0' }} icon={<PlusOutlined />}>{i18n('add_rule', '添加策略')}</Button>
            </Dropdown>
          </Col>
        </Row>
      );
    }
}
export default ActionList
