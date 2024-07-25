import React, { Component } from 'react'
import moment from 'moment'
import DatePicker from './DatePicker'
import MonthPicker from './MonthPicker'
import WeekPicker from './WeekPicker'
import _ from 'lodash'
// import { FormDebounceDate } from './../FormController/index'
/**
 * field      字段的属性
 * style      css样式
 * value      带时区的字符串值
 * onChange   改变的value函数
 * disabled   是否禁用（禁用为新的展示方式）
 * popupContainerId  时间组件弹框的父节点id
 */
export default class TicketDate extends Component {
  render() {
    const { field, value, ...dliver } = this.props
    const { timeGranularity } = field || {}
    // 对传入的value进行特殊处理
    let currentValue = value
    if (!moment.isMoment(value) && !_.isEmpty(value)) {
      if (_.isString(currentValue)) {
        currentValue = moment(currentValue)
      } else if (_.isNumber(currentValue) && !_.isNaN(currentValue)) {
        currentValue = moment(currentValue)
      }
    }

    switch (timeGranularity) {
      case 0:
        return <MonthPicker {...dliver} field={field} value={currentValue} />
      case 1:
        return <WeekPicker {...dliver} field={field} value={currentValue} />
      default:
        return <DatePicker {...dliver} field={field} value={currentValue} />
    }
  }
}

// export default ({ onChange, value, field, ...args }) => (
//   <FormDebounceDate onChange={onChange} value={value} code={field.code}>
//     <TicketDate {...{ field, ...args }} />
//   </FormDebounceDate>
// )
