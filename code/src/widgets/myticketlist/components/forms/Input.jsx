import React, { Component } from 'react'
import { Form, Input } from '@uyun/components'
import { inject } from '@uyun/core'
const FormItem = Form.Item

export default class ItsmInput extends Component {
  @inject('i18n') i18n
  render() {
    const { item, formItemLayout, getFieldDecorator, defaultValue, disabled } = this.props
    return (
      <FormItem {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <Input
            size="small"
            placeholder={`请输入${item.name}`}
            disabled={disabled}
            width={'100%'}
            allowClear
          />
        )}
      </FormItem>
    )
  }
}
