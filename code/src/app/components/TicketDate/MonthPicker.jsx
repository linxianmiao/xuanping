import React from 'react'
import moment from 'moment'
import { DatePicker } from '@uyun/components'

const MonthPicker = DatePicker.MonthPicker

export default function Month(props) {
  const { value, onChange, disabled, field, popupContainerId, size } = props
  //   if (disabled) {
  //     return moment(value).format('YYYY-Mo')
  //   }

  return (
    <MonthPicker
      value={value}
      format="YYYY-Mo"
      onChange={(value) => {
        onChange(value)
      }}
      id={field.code}
      disabled={disabled}
      style={{ width: '100%' }}
      placeholder={field.isRequired === 2 ? '' : '请选择月份'}
      getCalendarContainer={() =>
        popupContainerId ? document.getElementById(popupContainerId) : document.body
      }
      size={size || 'middle'}
    />
  )
}
