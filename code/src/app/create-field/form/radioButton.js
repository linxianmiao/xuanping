import React, { Component } from 'react'
import { Form, Radio } from '@uyun/components'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button

class ItsmRadioButton extends Component {
  render () {
    const { formItemLayout, item, getFieldDecorator, defaultValue } = this.props
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: String(defaultValue),
          rules: [{
            required: item.required === 1
          }]
        })(
          <RadioGroup buttonStyle="solid">
            {_.map(item.options, (item, i) => {
              return <RadioButton value={item.value} key={i}>{item.label}</RadioButton>
            })}
          </RadioGroup>
        )}
      </FormItem>
    )
  }
}

export default ItsmRadioButton
