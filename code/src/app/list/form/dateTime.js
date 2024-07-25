import React, { Component } from 'react'
import { DatePicker, Form } from '@uyun/components'
import moment from 'moment'
const FormItem = Form.Item
const RangePicker = DatePicker.RangePicker

export default class DateTime extends Component {
  onTagRangeChange = (range, value) => {
    const { setFieldsValue, item } = this.props
    setFieldsValue({ [item.code]: value || undefined })
  }

  getFormValue = (value) => {
    if (!value || value.length === 0) {
      return undefined
    }

    if (typeof value === 'string') {
      return value
    } else if (value.length === 1) {
      return value[0]
    } else if (value.length === 2) {
      return [moment(value[0]), moment(value[1])]
    }
  }

  getValuePropName = (value) => {
    return typeof value === 'string' || (value && value.length === 1) ? 'tagValue' : 'value'
  }

  disabledDate = (current) => {
    if (moment.isMoment(current)) {
      let [startTime, endTime] = window.time_control || []
      startTime = startTime || -Infinity
      endTime = endTime || Infinity
      current = current.valueOf()
      startTime = moment(startTime).isValid() ? moment(startTime).valueOf() : -Infinity
      endTime = moment(endTime).isValid() ? moment(endTime).valueOf() : Infinity
      return startTime > current || current > endTime
    }
    return false
  }

  getTagRange = (value) => {
    let tagRange = ''
    switch (value) {
      case 'CurrentDay':
        tagRange = '当天'
        break
      case 'CurrentWeek':
        tagRange = '本周'
        break
      case 'CurrentMonth':
        tagRange = '本月'
        break
      default:
        tagRange = undefined
        break
    }
    return tagRange
  }

  //  getFormat = (item) => {
  //    switch (item.timeGranularity) {
  //      case 0 : return 'YYYY-Mo'
  //      case 1 : return 'YYYY-wo'
  //      default: return 'YYYY-MM-DD'
  //    }
  //  }

  //  handlePanelChange = (value, mode) => {
  //    console.log(value)
  //    console.log(mode)
  //  }

  render() {
    const {
      item,
      formItemLayout,
      getFieldDecorator,
      defaultValue,
      size = 'default',
      getPopupContainer,
      getFieldValue,
      disabled,
      setFieldsValue,
      label
    } = this.props
    const value = getFieldValue(item.code) || defaultValue
    let tagRange
    if (this.getValuePropName(value) === 'tagValue') {
      tagRange = this.getTagRange(value)
    }
    return (
      <FormItem label={label || item.name} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: this.getFormValue(value),
          getValueFromEvent: this.defaultGetValueFromEvent,
          defaultGetValueFromEvent: this.defaultGetValueFromEvent,
          valuePropName: this.getValuePropName(value)
        })(
          <RangePicker
            style={{ width: '100%' }}
            size={size}
            disabled={disabled}
            defaultTagRange={tagRange}
            showTime={{ format: 'HH:mm:ss' }}
            format="YYYY-MM-DD HH:mm:ss"
            ranges={{ 当天: 'CurrentDay', 本周: 'CurrentWeek', 本月: 'CurrentMonth' }}
            tagRangeFormat={(value) => {
              if (tagRange) {
                return `${tagRange}`
              }
              return ''
            }}
            getCalendarContainer={getPopupContainer}
            onChange={this.onTagRangeChange}
            onTagRangeChange={(tagRange, tagValue) => {
              if (!_.isEmpty(tagValue)) {
                this.onTagRangeChange(tagRange, tagValue)
              } else if (this.getValuePropName(value) === 'tagValue') {
                setFieldsValue({ [item.code]: undefined })
              }
            }}
            disabledDate={this.disabledDate}
          />
        )}
      </FormItem>
    )
  }
}
