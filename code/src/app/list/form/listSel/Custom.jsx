import React, { Component } from 'react'
import { Select } from '@uyun/components'

const { Option } = Select

export default class Custom extends Component {
  render() {
    const {
      disabled,
      size,
      getPopupContainer,
      field,
      value,
      onChange,
      handleChange,
      noLabel,
      code
    } = this.props

    return (
      <Select
        mode="multiple"
        disabled={disabled}
        showSearch
        allowClear
        size={size}
        getPopupContainer={getPopupContainer}
        optionFilterProp="children"
        notFoundContent={i18n('globe.not_find', '无法找到')}
        filterOption={(inputValue, option) => {
          const { value, children } = option.props
          if (typeof children === 'string') {
            return [`${value}`, children].some(
              (item) => item.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
            )
          }
          return false
        }}
        placeholder={`${i18n('globe.select', '请选择')}${field.name}`}
        value={value}
        onChange={
          noLabel
            ? (value) => {
                handleChange({ [code]: value })
                onChange(value)
              }
            : onChange
        }
        className="filter-item-select"
      >
        {_.map(field.params, (param) => (
          <Option key={param.value} value={param.value}>
            {param.label}
          </Option>
        ))}
      </Select>
    )
  }
}
