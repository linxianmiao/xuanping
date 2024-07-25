import React, { Component } from 'react'
import { Form, Select } from '@uyun/components'
import { inject } from '@uyun/core'
const FormItem = Form.Item
const { Option, OptGroup } = Select
export default class ItsmAutomation extends Component {
  @inject('i18n') i18n

  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue, disabled } = this.props
    return (
      <FormItem label={''} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue || undefined
        })(
          <Select
            mode="multiple"
            size="small"
            disabled={disabled}
            placeholder={`请选择${item.name}`}
          >
            {_.map(item.resParams, (val, key) => {
              return (
                <OptGroup key={key} label={key}>
                  {_.map(val, (param) => {
                    return (
                      <Option key={param.value} value={param.value}>
                        {param.label}
                      </Option>
                    )
                  })}
                </OptGroup>
              )
            })}
          </Select>
        )}
      </FormItem>
    )
  }
}
