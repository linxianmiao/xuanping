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

  getTagRange = value => {
    if (!value || value.length === 0) {
      return undefined
    }

    const tagValue = typeof value === 'string' ? value : value[0]
    switch (tagValue) {
      case 'CurrentDay':
        return '当天'
      case 'CurrentWeek':
        return '本周'
      case 'CurrentMonth':
        return '本月'
      default:
        return undefined
    }
  }

  getFormValue = value => {
    if (!value || value.length === 0) {
      return undefined
    }

    if (typeof value === 'string') {
      return [value]
    } else if (value.length === 1) {
      return value
    } else if (value.length === 2) {
      return [moment(value[0]), moment(value[1])]
    }
  }

  getValuePropName = value => {
    return typeof value === 'string' || (value && value.length === 1) ? 'tagValue' : 'value'
  }

  render() {
    const { item, formItemLayout, getFieldDecorator, defaultValue, size = 'default', getPopupContainer, getFieldValue } = this.props
    const value = getFieldValue(item.code) || defaultValue

    return (
      <FormItem label={item.name} {...formItemLayout}>
        {
          getFieldDecorator(item.code, {
            initialValue: this.getFormValue(defaultValue),
            getValueFromEvent: this.defaultGetValueFromEvent,
            defaultGetValueFromEvent: this.defaultGetValueFromEvent,
            valuePropName: this.getValuePropName(value)
          })(
            <RangePicker
              size={size}
              format="YYYY-MM-DD"
              ranges={{ 当天: 'CurrentDay', 本周: 'CurrentWeek', 本月: 'CurrentMonth' }}
              tagRange={this.getTagRange(value)}
              getCalendarContainer={getPopupContainer}
              onTagRangeChange={this.onTagRangeChange}
            />
          )
        }
      </FormItem>
    )
  }
}
