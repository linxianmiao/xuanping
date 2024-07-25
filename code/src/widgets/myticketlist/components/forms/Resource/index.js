import React, { Component } from 'react'
import { Form } from '@uyun/components'
import CI from './Resource'
const FormItem = Form.Item

export default class Resource extends Component {
  render() {
    const { item, formItemLayout, getFieldDecorator, setFieldsValue, defaultValue, disabled } =
      this.props

    return (
      <FormItem label={''} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(<CI item={item} setFieldsValue={setFieldsValue} disabled={disabled} />)}
      </FormItem>
    )
  }
}
