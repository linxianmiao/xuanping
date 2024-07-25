import React, { Component } from 'react'
import { Form, Select } from '@uyun/components'
import { inject } from '@uyun/core'
const FormItem = Form.Item
const Option = Select.Option

export default class ItsmSelect extends Component {
  @inject('i18n') i18n
  render() {
    let { formItemLayout, item, getFieldDecorator, defaultValue, filterType, disabled } = this.props

    if (item.code === 'overdue') {
      if (_.isString(defaultValue)) {
        defaultValue = [Number(defaultValue)]
      } else if (_.isArray(defaultValue)) {
        defaultValue = _.map(defaultValue, (item) => Number(item))
      }
    }

    let options = item.params
    if (item.code === 'status' && (filterType === 'mytodo' || filterType === 'groupTodo')) {
      options = _.filter(options, (item) => _.includes(['1', '2', '10'], item.value))
    }

    return (
      <FormItem label={''} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue || []
        })(
          <Select
            mode="multiple"
            showSearch
            allowClear
            size="small"
            disabled={disabled}
            // disabled={
            //   disabled ||
            //   (item.code === 'status' && (filterType === 'mytodo' || filterType === 'groupTodo'))
            // }
            optionFilterProp="children"
            notFoundContent={this.i18n('globe.not_find', '无法找到')}
            filterOption={(inputValue, option) => {
              const { value, children } = option.props
              if (typeof children === 'string') {
                return [value, children].some(
                  (item) => item.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                )
              }
              return false
            }}
            placeholder={`${this.i18n('globe.select', '请选择')}${item.name}`}
          >
            {_.map(options, (param) => (
              <Option key={param.value} value={param.value}>
                {param.label}
              </Option>
            ))}
          </Select>
        )}
      </FormItem>
    )
  }
}
