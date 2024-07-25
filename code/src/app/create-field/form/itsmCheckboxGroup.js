import React, { Component } from 'react'
import { Form, Checkbox } from '@uyun/components'
const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
class ItsmCheckboxGroup extends Component {
  render () {
    const { formItemLayout, item, getFieldDecorator, defaultValue } = this.props
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <CheckboxGroup>
            {_.map(item.params, item => <Checkbox disabled={item.disable} key={item.value} value={item.value}>{item.label}</Checkbox>)}
          </CheckboxGroup>
        )}
      </FormItem>
    )
  }
}

export default ItsmCheckboxGroup
