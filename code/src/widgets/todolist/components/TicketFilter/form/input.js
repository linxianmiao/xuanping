import React, { Component } from 'react'
import { Form, Input } from '@uyun/components'
const FormItem = Form.Item

export default class ItsmInput extends Component {
  render () {
    const { item, formItemLayout, getFieldDecorator, defaultValue, size = 'default' } = this.props
    return (
      <FormItem label={item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(<Input size={size} placeholder={`${i18n('ticket.forms.pinput', '请输入')}${item.name}`} />)}
      </FormItem>
    )
  }
}
