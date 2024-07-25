import React, { Component } from 'react'
import { inject } from '@uyun/core'
import { Form, Select } from '@uyun/components'

const Option = Select.Option
const FormItem = Form.Item

export default class FormSelect extends Component {
  @inject('i18n') i18n

  render() {
    const { formItemLayout, item, getFieldDecorator } = this.props
    return (
      <FormItem label={item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: undefined
        })(
          <Select
            showSearch
            allowClear
            size="small"
            optionFilterProp="children"
            notFoundContent={this.i18n('globe.not_find', '无法找到')}
            filterOption={(inputValue, option) => {
              const { value, children } = option.props
              if (typeof children === 'string') {
                return [value, children].some(item => item.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1)
              }
              return false
            }}
            mode={item.code === 'overdue' ? '' : 'multiple'}
            placeholder={`${this.i18n('globe.select', '请选择')}${item.name}`}>
            {_.map(item.params, param => <Option key={param.value} value={`${param.value}`}>{param.label}</Option>)}
          </Select>
        )}
      </FormItem>
    )
  }
}
