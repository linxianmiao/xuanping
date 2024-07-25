import React, { Component } from 'react'
import { Form, InputNumber } from '@uyun/components'
import PasswordConfig from './passwordConfig'
import { Common } from '../index'
const FormItem = Form.Item
class Password extends Component {
  render () {
    const { formItemLayout } = this.props
    const { getFieldDecorator, setFieldsValue } = this.props.form
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      config: PasswordConfig,
      type: 'securityCode'
    })
    const { minLength, maxLength, builtin } = this.props.fieldData

    return (
      <Common {...diliver}>
        <FormItem {...formItemLayout} label={i18n('text_min_length', '文本最小长度')}>
          {getFieldDecorator('minLength', {
            initialValue: minLength,
            rules: [{
              validator: (rule, v, callback) => {
                let max = this.props.form.getFieldValue('maxLength')
                const min = _.isNumber(v) ? v : 0
                max = _.isNumber(max) ? max : Infinity
                if (_.gt(min, max)) {
                  callback(i18n('create-field-singleRowText-err3', '文本最小长度不能大于文本最大长度'))
                }
                callback()
              }
            }]
          })(
            <InputNumber min={0}  />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('text_max_length', '文本最大长度')}>
          {getFieldDecorator('maxLength', {
            initialValue: maxLength,
            rules: [{
              validator: (rule, v, callback) => {
                let min = this.props.form.getFieldValue('minLength')
                min = _.isNumber(min) ? min : 0
                const max = _.isNumber(v) ? v : Infinity
                if (_.lt(max, min)) {
                  callback(i18n('create-field-singleRowText-err4', '文本最大长度不能小于文本最小长度'))
                }
                callback()
              }
            }]
          })(
            <InputNumber min={0}  />
          )}
        </FormItem>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange()
  }
})(Password)
