import React, { Component } from 'react'
import { Form, Input } from '@uyun/components'
const FormItem = Form.Item

class Textarea extends Component {
  handleCheckTextarea = (item, rule, value, callback) => {
    if (rule.required && !value) {
      callback(`${i18n('ticket.forms.pinput' , '请输入')}${item.name}`)
    }else if (value && rule.max && value.length > rule.max) {
      callback(`${i18n('ticket.forms.beyond' , '不能高于')}${rule.max}${i18n('ticket.forms.character' , '字符')}`)
    } else if (value && rule.min && value.length < rule.min) {
      callback(`${i18n('ticket.forms.below' , '不能低于')}${rule.min}${i18n('ticket.forms.character' , '字符')}`)
    } else {
      callback()
    }
  }

  render () {
    const {formItemLayout, item, getFieldDecorator, defaultValue, row} = this.props
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue,
          rules: [{
            required: item.required === 1,
            min: item.minLength ? item.minLength : null,
            max: item.maxLength && item.maxLength > item.minLength ? item.maxLength : null,
            validator: (rule, value, callback) => { this.handleCheckTextarea(item, rule, value, callback) }
          }]
        })(
          <Input.TextArea 
            rows={row || 3} 
            placeholder={`${i18n('ticket.forms.pinput' , '请输入')}${item.name}`}
          />
        )}
      </FormItem>
    )
  }
}

export default Textarea
