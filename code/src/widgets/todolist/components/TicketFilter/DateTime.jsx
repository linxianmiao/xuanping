import React, { Component } from 'react'
import { DatePicker, Form } from '@uyun/components'
const FormItem = Form.Item
const RangePicker = DatePicker.RangePicker

export default class DateTime extends Component {
  render() {
    const { item, formItemLayout, getFieldDecorator } = this.props

    return (
      <FormItem label={item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: undefined
        })(
          <RangePicker size="small" />
        )}
      </FormItem>
    )
  }
}
