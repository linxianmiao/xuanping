import React from 'react'
import { DatePicker as Picker } from '@uyun/components'
import moment from 'moment'
import { getDateTimeValue } from '~/public/logic/dateTime'
export default class DatePicker extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      initialValue: undefined
    }
  }

  componentDidMount() {
    const { value } = this.props
    const initialValue = getDateTimeValue(value)
    if (this.props.onChange && initialValue) {
      window.FORM_LEAVE_NOTIRY = false
      this.props.onChange(initialValue)
    }
    this.setState({ initialValue })
  }

  componentWillReceiveProps(nextProps) {
    const value = nextProps.value
    if (JSON.stringify(value) !== JSON.stringify(this.state.initialValue)) {
      const initialValue = getDateTimeValue(value)
      window.FORM_LEAVE_NOTIRY = false
      this.props.onChange && this.props.onChange(initialValue, false)
      this.setState({ initialValue })
    }
  }

  disabledDate = (current) => {
    const { timeScope } = this.props.field
    current = current || moment().format('x')
    if (+timeScope === 1) {
      //之前的写法，当选择时间分钟后昨天的就变成可选了，改成以下写法就好了
      return current && current < moment().subtract(1, 'days').endOf('day')
    } else if (+timeScope === 2) {
      return current && moment(current).format('x') > moment().format('x')
    } else {
      return false
    }
  }

  range(start, end) {
    const result = []
    for (let i = start; i < end; i++) {
      result.push(i)
    }
    return result
  }

  // 根据选择日期不同控制时间是否可选
  disabledTime = (current) => {
    current = current || moment().format('x')
    const currentValue = moment(+current).format('YYYY-MM-DD')
    const now = moment().format('YYYY-MM-DD')
    const nowMinute = moment().minute()
    const nowHour = moment().hour()
    const currentValueHour =
      moment(+current).hour() || +moment(+current).hour() === 0 ? moment(+current).hour() : nowHour
    const isToday = moment(currentValue).isSame(now)
    const isHour = moment(nowHour).isSame(currentValueHour)
    if (this.props.field.formatDate) {
      return {}
    }
    if (+this.props.field.timeScope === 1) {
      return {
        disabledHours: () => (isToday ? this.range(0, nowHour) : []),
        disabledMinutes: () => (isToday && isHour ? this.range(0, nowMinute) : [])
      }
    } else if (+this.props.field.timeScope === 2) {
      return {
        disabledHours: () => (isToday ? this.range(nowHour + 1, 24) : []),
        disabledMinutes: () => (isToday && isHour ? this.range(nowMinute + 1, 60) : [])
      }
    } else {
      return {}
    }
  }

  render() {
    const { field, disabled, className, popupContainerId, size } = this.props
    const { timeGranularity } = field || {}
    const { initialValue } = this.state
    const format =
      field.timeGranularity === 2
        ? 'YYYY-MM-DD'
        : field.timeGranularity === 3
        ? 'YYYY-MM-DD HH:mm'
        : field.timeGranularity === 4
        ? 'YYYY-MM-DD HH:mm:ss'
        : 'YYYY-MM'
    const locale = {
      timezoneOffset: moment().zone()
    }
    if (field.code === 'yjwcsj') {
      console.log('format', format)
    }
    return (
      <Picker
        style={{ width: '100%' }}
        placeholder={
          field.isRequired === 2
            ? ''
            : `请选择或手动输入，格式:“2020-10-20${format ? '' : ' 16:20'}”`
        }
        value={initialValue}
        className={disabled ? className + ' no-padding-top' : className}
        locale={locale}
        format={format}
        disabled={field.isRequired === 2}
        showTime={timeGranularity === 2 ? false : { format: format }}
        onChange={(value) => {
          this.props.onChange(value)
        }}
        disabledDate={(current) => this.disabledDate(current)}
        disabledTime={(current) => this.disabledTime(current)}
        getCalendarContainer={() =>
          popupContainerId ? document.getElementById(popupContainerId) : document.body
        }
        id={field.code}
        size={size || 'middle'}
      />
    )
  }
}
