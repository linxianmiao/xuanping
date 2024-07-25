import React, { Component } from 'react'
import { Form } from '@uyun/components'
import ModelLazySelect from './ModelLazySelect'
const FormItem = Form.Item

export default class ModelSelect extends Component {
  render() {
    const { item, formItemLayout, getFieldDecorator, defaultValue, size = 'default', getPopupContainer } = this.props
    return (
      <FormItem label={item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(<ModelLazySelect
          size={size}
          mode="multiple"
          style={{ width: '100%' }}
          getPopupContainer={getPopupContainer}
        />)}
      </FormItem>
    )
  }
}
