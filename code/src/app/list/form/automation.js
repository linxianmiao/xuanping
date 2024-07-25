import React, { Component } from 'react'
import { Form, Select } from '@uyun/components'
const FormItem = Form.Item
const { Option, OptGroup } = Select
export default class ItsmAutomation extends Component {
  render () {
    const { formItemLayout, item, getFieldDecorator, defaultValue, size = 'default', getPopupContainer, disabled, label } = this.props
    return (
      <FormItem label={label || item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue || undefined
        })(
          <Select
            size={size}
            disabled={disabled}
            mode="multiple"
            placeholder={`${i18n('globe.select', '请选择')}${item.name}`}
            getPopupContainer={getPopupContainer}
          >
            {_.map(item.resParams, (val, key) => {
              return (
                <OptGroup key={key} label={key}>
                  { _.map(val, param => {
                    return (
                      <Option key={param.value} value={param.value}>
                        { param.label }
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
