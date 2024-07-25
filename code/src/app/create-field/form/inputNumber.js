import React, { Component } from 'react'
import { Form, InputNumber } from '@uyun/components'
const FormItem = Form.Item

class ITSMInputNumber extends Component {
  render () {
    const { formItemLayout, item, getFieldDecorator, defaultValue } = this.props
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue,
          rules: [{
            required: item.required === 1
          }]
        })(
          <InputNumber />
        )}
      </FormItem>
    )
  }
}

export default ITSMInputNumber
