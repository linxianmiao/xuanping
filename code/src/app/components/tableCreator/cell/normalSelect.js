import React from 'react'
import PropTypes from 'prop-types'
import { Select as USelect } from '@uyun/components'

const NormalSelect = (props) => {
  let { options, onChange, value, ...rest } = props
  // 因为选项数据是外部数据，所以需要转成labelInValue格式
  const parseValue = () => {
    const { value } = props
    return value && value.value ? value.value : value
  }
  let filterFn = (i) => i
  if (props.field && props.field.code && window[`${props.field.code}_filterFunction`]) {
    let fn = window[`${props.field.code}_filterFunction`]
    if (typeof fn === 'function') {
      filterFn = fn
    }
  }

  return (
    <USelect
      {...rest}
      showSearch
      allowClear
      value={parseValue()}
      optionFilterProp="children"
      notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
      dropdownMatchSelectWidth={false}
      onChange={onChange}
    >
      {options &&
        options.filter(filterFn).map((item) => (
          <USelect.Option key={`${item.value}`} value={`${item.value}`}>
            {item.label}
          </USelect.Option>
        ))}
    </USelect>
  )
}

NormalSelect.propTypes = {
  opitons: PropTypes.arrayOf({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  })
}

export default NormalSelect
