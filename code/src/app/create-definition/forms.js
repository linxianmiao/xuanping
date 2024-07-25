import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import { Form, Input, Select, Radio } from '@uyun/components'
import ServiceTime from './serviceTime'
import { priorityList, timeList } from './config'
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

@inject('createDefinitionStore')
@observer
class Forms extends Component {
    handleValidator = (rule, value, callback) => {
      const pattern = new RegExp(rule.pattern)
      if (!value) {
        callback(`${i18n('ticket.forms.pinput', '请输入')}${i18n('ticket.sla.label1', '约定时间')}`)
      } else if (!pattern.test(value)) {
        callback(`${i18n('ticket.forms.pinput', '请输入')}${i18n('param_number', '数字')}`)
      }
      callback()
    }

    render () {
      const { getFieldDecorator } = this.props.form
      const { time_policy, priority, name, description, unit, time } = toJS(this.props.createDefinitionStore.sla)
      const { formItemLayout } = this.props
      const selectAfter = (
        <div>
          {getFieldDecorator('unit', {
            initialValue: unit || 'MINUTES',
            rules: [{
              required: true
            }]
          })(<Select style={{ width: 100 }}>
            {_.map(timeList, item => <Option value={item.value} key={item.value}>{item.label}</Option>)}
          </Select>)}
        </div>
      )
      return (
        <Form>
          <FormItem label={i18n('conf.model.field.card.name', '名称')} {...formItemLayout}>
            {getFieldDecorator('name', {
              initialValue: name,
              rules: [{
                required: true,
                whitespace: true,
                message: i18n('ticket.forms.pinputName', '请输入名称')
              }]
            })(<Input
              placeholder={i18n('ticket.forms.pinputName', '请输入名称')}
              maxLength="20" />)}
          </FormItem>
          <FormItem label={i18n('create-definition-priority', '级别')} {...formItemLayout}>
            {getFieldDecorator('priority', {
              initialValue: typeof priority === 'number' ? String(priority) : undefined,
              rules: [{
                required: true,
                message: `${i18n('globe.select', '请选择')}${i18n('create-definition-priority', '级别')}`
              }]
            })(<Select
              showSearch
              placeholder={`${i18n('globe.select', '请选择')}${i18n('create-definition-priority', '级别')}`}
              optionFilterProp="children">
              {_.map(priorityList, item => {
                return <Option value={item.value} key={item.value}>{item.label}</Option>
              })}
            </Select>)}
          </FormItem>
          <FormItem label={i18n('create-definition-time_policy', '服务时间')} {...formItemLayout}>
            {getFieldDecorator('time_policy', {
              initialValue: time_policy,
              rules: [{
                required: true,
                message: `${i18n('globe.select', '请选择')}${i18n('create-definition-time_policy', '服务时间')}`
              }]
            })(<ServiceTime placeholder={`${i18n('globe.select', '请选择')}${i18n('create-definition-time_policy', '服务时间')}`} />)}
          </FormItem>
          <FormItem label={i18n('ticket.sla.label1', '约定时间')} {...formItemLayout} className="form-item-appointed-time">
            {getFieldDecorator('time', {
              initialValue: time,
              rules: [{
                pattern: '^[0-9]*$',
                required: true,
                validator: (rule, value, callback) => { this.handleValidator(rule, value, callback) }
              }]
            })(<Input
              placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n('ticket.sla.label1', '约定时间')}`}
              addonAfter={selectAfter} />)}
          </FormItem>
          <FormItem label={i18n('create-definition-description', '协议记录')} {...formItemLayout}>
            {getFieldDecorator('description', {
              initialValue: description || '',
              rules: [{
                required: false
              }]
            })(<Input.TextArea
              placeholder={`${i18n('ticket.forms.pinput', '请输入')}${i18n('create-definition-description', '协议记录')}`}
              maxLength="50" />)}
          </FormItem>
        </Form>
      )
    }
}

export default Form.create()(Forms)
