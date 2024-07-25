import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Form, Button, Dropdown, Menu } from '@uyun/components'
import Time from './components/time'
import Color from './components/color'
import Notice from './components/notice'
const FormItem = Form.Item

@inject('triggerStore')
@observer
class ActionItem extends Component {
    handleChange = (value) => {
      this.props.onChange(value, this.props.index)
    }

    // 同样的动作只能添加一次   2 === 通知  ;   1 === 标记颜色
    addAction = (e) => {
      const { actionTypes } = this.props.triggerStore
      const { item } = this.props
      const { types } = this.props.item
      switch (e.key) {
        case '1' : types.push('1'); break
        case '2' : types.push('2'); break
      }

      // 给每个动作增加actionCode属性
      item.actions.forEach(action => {
        const t = actionTypes.find(a => a.type === action.type)
        if (t) {
          action.actionCode = t.actionCode
        }
      })

      this.handleChange(_.assign({}, item, { types }))
    }

    render () {
      const { item, index, triggerNode } = this.props
      const { types = [], strategyType } = item
      const formItemLayout = {
        labelCol: { span: 3 },
        wrapperCol: { span: 20 }
      }
      const dilver = {
        item,
        triggerNode,
        formItemLayout,
        handleChange: this.handleChange
      }
      const menu = (
        <Menu onClick={this.addAction}>
          <Menu.Item key="2" disabled={_.includes(types, '2')}>{i18n('SLA.notice', '通知')}</Menu.Item>
          <Menu.Item key="1" disabled={_.includes(types, '1')}>{i18n('SLA.mark_color', '标记颜色')}</Menu.Item>
        </Menu>
      )
      return (
        <React.Fragment>
          { Boolean(index) &&
          <FormItem required {...formItemLayout}
            label={String(strategyType) === '1' ? i18n('sla-policy-overtime', '超时') : i18n('sla-policy-advance', '提前')}>
            <Time {...dilver} />
          </FormItem> }
          <FormItem label={i18n('sla-policy-action', '动作')} {...formItemLayout}>
            {_.includes(types, '1') && <Color {...dilver} />}
            {_.includes(types, '2') && <Notice {...dilver} />}
            <Dropdown overlay={menu}>
              <Button block style={{ width: 256 }}>{i18n('add_action', '添加动作')}</Button>
            </Dropdown>
          </FormItem>
        </React.Fragment>
      )
    }
}
export default ActionItem
