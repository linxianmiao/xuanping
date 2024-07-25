// 触发事件和条件
import React, { Component, Fragment } from 'react'
import { Form, Select } from '@uyun/components'
import { observer, inject } from 'mobx-react'
import incidentList from '../create-policy/config/conditonList'
import Rules from './components/rules'
import { formItemLayout } from './config/config'

const Option = Select.Option
const FormItem = Form.Item

@inject('triggerStore')
@observer
export default class TriggerEvent extends Component {
  changeType = e => {
    const type = e.target.value
    this.props.triggerStore.getActionListByType(type)
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { incident, triggerConditions } = this.props.triggerStore.trigger
    return (
      <Fragment>
        <FormItem label={i18n('trigger.incident', '触发事件')} {...formItemLayout}>
          {getFieldDecorator('incident', {
            initialValue: incident,
            rules: [{ required: true, message: `${i18n('globe.select', '请选择')}${i18n('trigger.incident', '触发事件')}` }]
          })(
            <Select
              mode="multiple"
              placeholder={`${i18n('globe.select', '请选择')}${i18n('trigger.incident', '触发事件')}`}>
              {incidentList.map(item => <Option key={item.code} value={item.code}>{item.name}</Option>)}
            </Select>
          )}
        </FormItem>
        <FormItem label={i18n('trigger_condition')} {...Object.assign({}, formItemLayout, { wrapperCol: { span: 22 } })}>
          {getFieldDecorator('triggerConditions', {
            initialValue: triggerConditions || {
              when: 'all',
              conditionExpressions: [],
              nestingConditions: []
            }
          })(
            <Rules />
          )}
        </FormItem>
      </Fragment >
    )
  }
}
