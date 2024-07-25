import React, { Component } from 'react'
import { Form, Input } from '@uyun/components'
const FormItem = Form.Item

class ModelCode extends Component {
  handleCheckSingleRowText = (item, rule, value, callback) => {
    const myReg = /^[a-zA-Z0-9_-]+$/
    if (!value) {
      callback(`${i18n('ticket.forms.pinput', '请输入')}${item.name}`)
    }
    if (value && !myReg.test(value)) {
      callback(i18n('field_create_code_error4', '编码只能为英文数字下划线中划线'))
    }
    if (value && rule.max && value.length > rule.max) {
      callback(`${i18n('ticket.forms.beyond', '不能高于')}${rule.max}${i18n('ticket.forms.character', '字符')}`)
    } else if (value && rule.min && value.length < rule.min) {
      callback(`${i18n('ticket.forms.below', '不能低于')}${rule.min}${i18n('ticket.forms.character', '字符')}`)
    } else {
      callback()
    }
  }

  render () {
    const { formItemLayout, item, getFieldDecorator, defaultValue } = this.props
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue,
          rules: [{
            required: item.required === 1,
            min: item.minLength ? item.minLength : null,
            max: item.maxLength && item.maxLength > item.minLength ? item.maxLength : null,
            validator: (rule, value, callback) => { this.handleCheckSingleRowText(item, rule, value, callback) }
          }]
        })(
          <Input
            size="default"
            placeholder={`${i18n('ticket.forms.pinput', '请输入')}${item.name}`}
          />
        )}
      </FormItem>
    )
  }
}

export default ModelCode
