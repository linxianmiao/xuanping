import React from 'react'
import moment from 'moment'
import { DatePicker } from '@uyun/components'

const WeekPicker = DatePicker.WeekPicker

export default function Week(props) {
  const { value, onChange, disabled, field, popupContainerId, size } = props

  //   if (disabled) {
  //     return moment(value).format('gggg-wo')
  //   }

  return (
    <WeekPicker
      value={value}
      onChange={(value) => {
        onChange(value)
      }}
      id={field.code}
      disabled={disabled}
      style={{ width: '100%' }}
      placeholder={field.isRequired === 2 ? '' : '请选择周'}
      getCalendarContainer={() =>
        popupContainerId ? document.getElementById(popupContainerId) : document.body
      }
      size={size || 'middle'}
    />
  )
}
