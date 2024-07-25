import React, { Component } from 'react'
import { DatePicker } from '@uyun/components'
import moment from 'moment'
const { RangePicker } = DatePicker
const MonthPicker = DatePicker.MonthPicker

class DataTime extends Component {
  render() {
    const { value, disabled, handleChange, comparison, selectedField, logics } = this.props
    let timeGranularity = selectedField?.params?.timeGranularity || undefined
    if (!_.isEmpty(logics)) {
      timeGranularity = logics?.timeGranularity
    }
    const format =
      timeGranularity === 2
        ? 'YYYY-MM-DD'
        : timeGranularity === 0
        ? 'YYYY-MM'
        : timeGranularity === 3
        ? 'YYYY-MM-DD HH:mm'
        : 'YYYY-MM-DD HH:mm:ss'
    return comparison === 'BETWEEN' ? (
      <RangePicker
        disabled={disabled}
        value={_.isEmpty(value) ? value : [moment(Number(value[0])), moment(Number(value[1]))]}
        format={format}
        showTime={timeGranularity === 2 ? false : { format: format }}
        onChange={(date) => {
          // 时间转为时间戳
          if (_.isEmpty(date)) {
            handleChange(undefined)
          } else {
            handleChange([`${date[0].valueOf()}`, `${date[1].valueOf()}`])
          }
        }}
      />
    ) : timeGranularity === 0 ? (
      <MonthPicker
        value={value ? moment(Number(value)) : value}
        format="YYYY-Mo"
        onChange={(date) => {
          // 时间转为时间戳
          if (date) {
            handleChange(`${date.valueOf()}`)
          } else {
            handleChange(undefined)
          }
        }}
        placeholder={i18n('globe.select', '请选择')}
      />
    ) : (
      <DatePicker
        disabled={disabled}
        value={value ? moment(Number(value)) : value}
        format={format}
        showTime={timeGranularity === 2 ? false : { format: format }}
        onChange={(date) => {
          // 时间转为时间戳
          if (date) {
            handleChange(`${date.valueOf()}`)
          } else {
            handleChange(undefined)
          }
        }}
        placeholder={i18n('globe.select', '请选择')}
      />
    )
  }
}

export default DataTime
