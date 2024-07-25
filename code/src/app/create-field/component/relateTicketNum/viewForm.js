import React, { Component } from 'react'
import { Form, Button, message } from '@uyun/components'
import View from './view'
import _ from 'lodash'
const FormItem = Form.Item

@Form.create()
export default class ViewForm extends Component {
  constructor (props) {
    super(props)
    this.view = React.createRef()
  }

  validator = (rule, value, callback) => {
    if (this.view.current && _.isFunction(this.view.current.validator)) {
      this.view.current.validator(rule, value, callback)
    } else {
      if (rule.required && value == null) {
        callback(`${i18n('globe.select', '请选择')}${this.props.field.name}`)
      } else {
        callback()
      }
    }
  }

  onClick = () => {
    this.props.form.validateFieldsAndScroll((errors, values) => {
      if (errors) return false
      message.success('校验成功')
    })
  }

  render () {
    const { getFieldDecorator } = this.props.form
    return (
      <Form layout="vertical">
        <FormItem label="默认值">
          {getFieldDecorator('defaultValue', {
            initialValue: undefined,
            rules: [{
              required: true,
              validator: this.validator
            }]
          })(
            <View
              ref={this.view}
              validator={this.validator}
            />
          )}
        </FormItem>
        <Button onClick={this.onClick}>校验</Button>
      </Form>
    )
  }
}
