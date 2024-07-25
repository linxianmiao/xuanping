import React from 'react'
import { Select as USelect } from '@uyun/components'
import { getColorItemClsName } from './factory'

const UOption = USelect.Option

const Select = (props) => {
  const { isChooseColor, options, value, ...restProps } = props

  const parseValue = () => {
    return value && value.value ? value.value : value
  }

  const getSelectClsName = () => {
    if (!isChooseColor || !value) {
      return ''
    }

    const selectedOption = options.find((item) => item.value === value)

    if (!selectedOption) {
      return ''
    }

    const colorClsName = getColorItemClsName(selectedOption.color)

    return `select-with-color ${colorClsName}`
  }
  let formatValue = parseValue()
  if (formatValue !== undefined) {
    if (options[0] && typeof options[0].value === 'number') {
      formatValue = +formatValue
    } else {
      formatValue = `${formatValue}`
    }
  }

  return (
    <USelect
      className={getSelectClsName()}
      showSearch
      allowClear
      value={formatValue}
      optionFilterProp="children"
      notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
      dropdownMatchSelectWidth={false}
      {...restProps}
    >
      {options.map((option) => {
        return (
          <UOption key={option.value} value={option.value}>
            {option.label}
          </UOption>
        )
      })}
    </USelect>
  )
}

Select.defaultProps = {
  isChooseColor: false,
  options: []
}

export default Select
