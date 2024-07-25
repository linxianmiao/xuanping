import React, { Component } from 'react'
import { Input, Form } from '@uyun/components'
const FormItem = Form.Item
export default class SignleRowText extends Component {
  render() {
    const { item, formItemLayout } = this.props
    const { getFieldDecorator } = this.props.form
    const {
      placeholder = `${i18n('ticket.forms.pinput', '请输入')}${item.name}`,
      maxLength = 32,
      validator = (rule, value, callback) => {
        const regName = new RegExp('[|;&$%><`\\!]')
        const regCode = new RegExp('^[a-zA-Z0-9_]+$')
        if (rule.required && !value) {
          callback(placeholder)
        } else if (item.code === 'name' && regName.test(value)) {
          callback(i18n('ticket.true.name', '名称不能含有特殊字符'))
        } else if (item.code === 'code' && !regCode.test(value)) {
          callback(i18n('field_create_code_error1', '编码只能为英文数字下划线'))
        } else {
          callback()
        }
      }
    } = item
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {
          getFieldDecorator(item.code, {
            initialValue: item.value,
            rules: [
              {
                required: item.required,
                validator: validator
              }
            ]
          })(
            <Input
              allowClear
              disabled={item.disabled}
              placeholder={placeholder}
              maxLength={maxLength}
            />
          )
        }
      </FormItem>
    )
  }
}