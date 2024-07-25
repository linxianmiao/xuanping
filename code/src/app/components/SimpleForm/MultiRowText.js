import React, { Component } from 'react'
import { Input, Form } from '@uyun/components'
const FormItem = Form.Item
export default class MultiRowText extends Component {
  render() {
    const { item, formItemLayout } = this.props
    const { getFieldDecorator } = this.props.form
    const {
      placeholder = `${i18n('ticket.forms.pinput', '请输入')}${item.name}`,
      maxLength = 50
    } = item
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {
          getFieldDecorator(item.code, {
            initialValue: item.value,
            rules: [
              { required: item.required, message: placeholder }
            ]
          })(
            <Input.TextArea
              disabled={item.disabled}
              placeholder={placeholder}
              maxLength={maxLength}
              autosize={{ maxRows: item.maxRowHeight || undefined }}
            />
          )
        }
      </FormItem>
    )
  }
}