import React from 'react'
import { Select } from '@uyun/components'

const Option = Select.Option

const ExpandValue = props => {
  const { data, value, onChange } = props

  return (
    <Select
      mode="tags"
      showSearch
      allowClear
      optionFilterProp="children"
      notFoundContent={i18n('globe.notFound', '无法找到')}
      value={value || undefined}
      onChange={onChange}>
      {_.map(data, (item, i) => {
        return <Option key={i} value={`${item.value}`}>{item.label}</Option>
      })}
    </Select>
  )
}

export default ExpandValue
