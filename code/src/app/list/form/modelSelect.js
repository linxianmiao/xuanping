import React, { Component } from 'react'
import { Form } from '@uyun/components'
import ModelLazySelect from '../components/modelLazySelect'
const FormItem = Form.Item

export default class ModelSelect extends Component {
  render() {
    const { item, formItemLayout, getFieldDecorator, defaultValue, size = 'default', getPopupContainer, disabled, label, filterType } = this.props
    return (
      <FormItem label={label || item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(<ModelLazySelect
          disabled={disabled}
          filterType={filterType}
          authFilter
          size={size}
          mode="multiple"
          style={{ width: '100%' }}
          getPopupContainer={getPopupContainer}
        />)}
      </FormItem>
    )
  }
}
