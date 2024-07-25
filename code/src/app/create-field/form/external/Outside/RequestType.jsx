import React from 'react'
import { Select } from '@uyun/components'

const Option = Select.Option

const RequestType = props => {
  const { value, onChange } = props

  return (
    <Select
      style={{ width: 500 }}
      value={value}
      onChange={onChange}
    >
      <Option value="get">GET</Option>
      <Option value="post">POST</Option>
    </Select>
  )
}

export default RequestType
