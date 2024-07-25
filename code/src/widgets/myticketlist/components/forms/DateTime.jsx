import React, { Component } from 'react'
import { DatePicker, Form } from '@uyun/components'
import { inject } from '@uyun/core'
import moment from 'moment'
const FormItem = Form.Item
const RangePicker = DatePicker.RangePicker

export default class DateTime extends Component {
  @inject('i18n') i18n
  onTagRangeChange = (range, value) => {
    const { setFieldsValue, item } = this.props
    setFieldsValue({ [item.code]: value || undefined })
  }

  getFormValue = (value) => {
    console.log('value', value)
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

  getTagRange = (value) => {
    if (!value || value.length === 0) {
      return undefined
    }
    console.log('标签', value)
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

  render() {
    const {
      item,
      formItemLayout,
      getFieldDecorator,
      defaultValue,
      getFieldValue,
      disabled,
      setFieldsValue
    } = this.props
    const value = getFieldValue(item.code) || defaultValue
    const valuePropName = typeof value === 'string' ? 'tagValue' : 'value'
    let tagRange
    if (valuePropName === 'tagValue') {
      tagRange = this.getTagRange(value)
    }
    return (
      <FormItem label={''} {...formItemLayout}>
        {getFieldDecorator(item.code, {
          initialValue: this.getFormValue(defaultValue),
          getValueFromEvent: this.defaultGetValueFromEvent,
          defaultGetValueFromEvent: this.defaultGetValueFromEvent,
          valuePropName
        })(
          <RangePicker
            disabled={disabled}
            format="YYYY-MM-DD HH:mm:ss"
            size="small"
            ranges={{ 当天: 'CurrentDay', 本周: 'CurrentWeek', 本月: 'CurrentMonth' }}
            tagRangeFormat={(value) => {
              if (tagRange) {
                return `${tagRange}`
              }
              return ''
            }}
            onChange={this.onTagRangeChange}
            onTagRangeChange={(tagRange, tagValue) => {
              if (!_.isEmpty(tagValue)) {
                this.onTagRangeChange(tagRange, tagValue)
              } else if (valuePropName === 'tagValue') {
                setFieldsValue({ [item.code]: undefined })
              }
            }}
            placeholder={[`请选择${item.name}`, '']}
          />
        )}
      </FormItem>
    )
  }
}
