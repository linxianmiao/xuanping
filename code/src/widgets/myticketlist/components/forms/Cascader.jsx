import React, { Component } from 'react'
import { Form, Cascader } from '@uyun/components'
import { inject } from '@uyun/core'
const FormItem = Form.Item

export default class ItsmCascader extends Component {
  @inject('i18n') i18n
  render() {
    const { item, formItemLayout, getFieldDecorator, defaultValue, disabled } = this.props
    return (
      <FormItem label={''} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <Cascader
            disabled={disabled}
            allowClear
            changeOnSelect
            size="small"
            options={item.cascade}
            placeholder={`请选择${item.name}`}
          />
        )}
      </FormItem>
    )
  }
}
