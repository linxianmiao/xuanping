import React, { Component } from 'react'
import { Form, Cascader } from '@uyun/components'
const FormItem = Form.Item

export default class ItsmCascader extends Component {
  render () {
    const { item, formItemLayout, getFieldDecorator, defaultValue, size = 'default', disabled, label } = this.props
    return (
      <FormItem label={label || item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(<Cascader
          disabled={disabled}
          allowClear
          changeOnSelect
          size={size}
          options={item.cascade}
          placeholder={`${i18n('globe.select', '请选择')}${item.name}`} />)}
      </FormItem>
    )
  }
}
