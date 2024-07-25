import React, { Component } from 'react'
import { Form, Input, InputNumber } from '@uyun/components'
import MultiRowTextConfig from './multiRowTextConfig'

import { Common } from '../index'

const FormItem = Form.Item

const defaultMaxLength = 1000

const TextArea = Input.TextArea

class MultiRowText extends Component {
  render() {
    const { formItemLayout } = this.props
    const { getFieldDecorator } = this.props.form
    const { defaultValue, minLength, maxLength, maxRowHeight } = this.props.fieldData
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      config: MultiRowTextConfig,
      type: 'MultiRowText'
    })
    return (
      <Common {...diliver}>
        <FormItem {...formItemLayout} label={i18n('default_value', '默认值')}>
          {getFieldDecorator('defaultValue', {
            initialValue: defaultValue,
            rules: [
              {
                validator: (rule, v, callback) => {
                  let max = this.props.form.getFieldValue('maxLength')
                  let min = this.props.form.getFieldValue('minLength')

                  max = _.isNumber(max) ? max : defaultMaxLength
                  min = _.isNumber(min) ? min : 0

                  if (_.isEmpty(v)) {
                    callback()
                  } else {
                    const length = v.length
                    if (_.gt(length, max)) {
                      callback(
                        i18n('create-field-singleRowText-err1', '默认值长度不能大于文本最大长度')
                      )
                    } else if (_.lt(length, min)) {
                      callback(
                        i18n('create-field-singleRowText-err2', '默认值长度不能小于文本最小长度')
                      )
                    } else {
                      callback()
                    }
                  }
                }
              }
            ]
          })(<TextArea placeholder={i18n('please-input', '请输入')} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('text_min_length', '文本最小长度')}>
          {getFieldDecorator('minLength', {
            initialValue: minLength,
            rules: [
              {
                validator: (rule, v, callback) => {
                  let max = this.props.form.getFieldValue('maxLength')
                  const min = _.isNumber(v) ? v : 0
                  max = _.isNumber(max) ? max : defaultMaxLength
                  if (_.gt(min, max)) {
                    callback(
                      i18n('create-field-singleRowText-err3', '文本最小长度不能大于文本最大长度')
                    )
                  }
                  callback()
                }
              }
            ]
          })(<InputNumber min={0} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={i18n('text_max_length', '文本最大长度')}>
          {getFieldDecorator('maxLength', {
            initialValue: maxLength,
            rules: [
              {
                validator: (rule, v, callback) => {
                  let min = this.props.form.getFieldValue('minLength')
                  min = _.isNumber(min) ? min : 0
                  const max = _.isNumber(v) ? v : defaultMaxLength
                  if (_.lt(max, min)) {
                    callback(
                      i18n('create-field-singleRowText-err4', '文本最大长度不能小于文本最小长度')
                    )
                  }
                  callback()
                }
              }
            ]
          })(<InputNumber min={0} max={defaultMaxLength} />)}
        </FormItem>
        <FormItem {...formItemLayout} label={'高度限制'}>
          {getFieldDecorator('maxRowHeight', {
            initialValue: _.isNumber(maxRowHeight) ? maxRowHeight : undefined
          })(<InputNumber min={0} max={defaultMaxLength} />)}
          <>{'行'}</>
        </FormItem>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange()
  }
})(MultiRowText)
