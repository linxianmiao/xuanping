import React, { Component } from 'react'
import { Form, Select } from '@uyun/components'
const FormItem = Form.Item
const Option = Select.Option

export default class ItsmSelect extends Component {
  render() {
    let { formItemLayout, item, getFieldDecorator, defaultValue, size = 'default', filterType, getPopupContainer } = this.props

    if (item.code === 'overdue') {
      if (_.isString(defaultValue)) {
        defaultValue = [Number(defaultValue)]
      } else if (_.isArray(defaultValue)) {
        defaultValue = _.map(defaultValue, item => Number(item))
      }
    }

    return (
      <FormItem label={item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue || []
        })(
          <Select
            mode="multiple"
            disabled={item.code === 'status' && (filterType === 'myToDo' || filterType === 'groupTodo')}
            showSearch
            allowClear
            size={size}
            getPopupContainer={getPopupContainer || (el => el)}
            optionFilterProp="children"
            notFoundContent={i18n('globe.not_find', '无法找到')}
            filterOption={(inputValue, option) => {
              const { value, children } = option.props
              if (typeof children === 'string') {
                return [value, children].some(item => item.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1)
              }
              return false
            }}
            placeholder={`${i18n('globe.select', '请选择')}${item.name}`}>
            {_.map(item.params, param => <Option key={param.value} value={param.value}>{param.label}</Option>)}
          </Select>
        )}
      </FormItem>
    )
  }
}
