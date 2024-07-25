import React from 'react'
import { Input } from '@uyun/components'

const defaultMaxLength = 500

const SingleRowText = ({ field = {}, disabled = false, value, onChange = () => {}, ...rest }) => {
  return (
    <Input
      // maxLength={field.maxLength}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  )
}

export default SingleRowText
