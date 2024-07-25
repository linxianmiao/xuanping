import React, { useCallback } from 'react'
import { Select } from '@uyun/components'

const Option = Select.Option

const OutlineSelect = ({
  links = [],
  value,
  onChange = () => {}
}) => {
  const getValue = useCallback(value => {
    return value ? { label: value.outFlowName, key: value.outFlowId } : undefined
  }, [])

  return (
    <Select
      placeholder="请选择迁出路径"
      labelInValue
      value={getValue(value)}
      onChange={({ key, label }) => onChange({ outFlowName: label, outFlowId: key })}
    >
      {
        links.map(item => <Option key={item.id}>{item.text}</Option>)
      }
    </Select>
  )
}

export default OutlineSelect
