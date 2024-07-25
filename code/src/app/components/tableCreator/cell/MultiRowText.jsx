import React from 'react'
import { Input } from '@uyun/components'

const TextArea = Input.TextArea

const MultiRowText = ({
  field = {},
  disabled = false,
  value,
  onChange = () => {},
  ...rest
}) => {
  return (
    <TextArea
      maxLength={field.maxLength || undefined}
      disabled={disabled}
      autosize={{ minRows: 2, maxRows: field.maxRowHeight || undefined }}
      value={value}
      onChange={e => onChange(e.target.value)}
      {...rest}
    />
  )
}

export default MultiRowText
