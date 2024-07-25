import React from 'react'
import { Input } from '@uyun/components'

export default function Title(props) {
  const { value, setValue } = props
  return (
    <Input.Search
      allowClear
      value={value}
      placeholder={i18n('globe.keywords', '请输入关键字')}
      onChange={e => { setValue(e.target.value) }}
    />
  )
}