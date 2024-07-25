import React from 'react'
import { Cascader } from '@uyun/components'

const MyCascader = ({ field = {}, disabled = false, value, onChange = () => {}, ...rest }) => {
  return (
    <Cascader
      disabled={disabled}
      value={value}
      options={field.cascade}
      onChange={onChange}
      {...rest}
    />
  )
}

export default MyCascader
