import React, { Component } from 'react'
import { Form, Input } from '@uyun/components'
const FormItem = Form.Item

export default class ItsmInput extends Component {
  render() {
    const {
      item,
      formItemLayout,
      getFieldDecorator,
      defaultValue,
      size = 'default',
      disabled,
      label,
      noLabel = false,
      handleChange = () => {}
    } = this.props
    return (
      <>
        {noLabel ? (
          <FormItem {...formItemLayout}>
            {getFieldDecorator(item.code, {
              initialValue: defaultValue
            })(
              <Input.Search
                allowClear
                size={size}
                placeholder={`${i18n('ticket.forms.pinput', '请输入')}${item.name}`}
                disabled={disabled}
                onSearch={(value) => {
                  handleChange({ [item.code]: value })
                }}
              />
            )}
          </FormItem>
        ) : (
          <FormItem label={noLabel ? '' : label || item.name} {...formItemLayout}>
            {getFieldDecorator(item.code, {
              initialValue: defaultValue
            })(
              <Input
                size={size}
                placeholder={`${i18n('ticket.forms.pinput', '请输入')}${item.name}`}
                disabled={disabled}
              />
            )}
          </FormItem>
        )}
      </>
    )
  }
}
