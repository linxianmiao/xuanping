import React, { Component } from 'react'
import { Form, Select, Input, InputNumber } from '@uyun/components'
import SingleRowTextConfig from './singleRowTextConfig'
import { matchReg } from '~/ticket/forms/utils/stringify'
import configList from '../config'
import { Common } from '../index'

const FormItem = Form.Item
const Option = Select.Option

const defaultMaxLength = 500

class SingleRowText extends Component {
  state = {
    filter: this.props.fieldData.validation || 'none'
  }

  onChange = (value) => {
    this.setState({ filter: value })
  }

  handleValidator = (rule, value, callback) => {
    if (!value) {
      callback(i18n('pls_input_reg', '请输入正则表达式'))
    } else {
      if (!/^[\\/].*[\\/]$/.test(value)) {
        callback(i18n('pls_input_right_res', '请输入正确的正则表达式'))
      } else {
        // 进一步校验自定义正则表达式的正确性
        try {
          eval(value)
          callback()
        } catch (error) {
          callback(i18n('pls_input_right_res', '请输入正确的正则表达式'))
        }
      }
    }
  }

  render() {
    const { formItemLayout, source } = this.props
    const { filter } = this.state
    const { getFieldDecorator } = this.props.form
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      config: source === 'dataBase' ? configList(SingleRowTextConfig) : SingleRowTextConfig,
      type: 'singleRowText'
    })
    const { defaultValue, reg, validation, minLength, maxLength } = this.props.fieldData
    return (
      <Common {...diliver}>
        {
          <FormItem {...formItemLayout} label={i18n('default_value', '默认值')}>
            {getFieldDecorator('defaultValue', {
              initialValue: defaultValue,
              rules: [
                {
                  validator: (rule, v, callback) => {
                    let max = this.props.form.getFieldValue('maxLength')
                    let min = this.props.form.getFieldValue('minLength')
                    const validation = this.props.form.getFieldValue('validation')
                    const reg = this.props.form.getFieldValue('reg')

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
                      } else if (validation !== 'none') {
                        const { match, message } = matchReg(v, validation, reg)
                        if (!match) {
                          callback(message)
                        }
                        callback()
                      } else {
                        callback()
                      }
                    }
                  }
                }
              ]
            })(<Input placeholder={i18n('please-input', '请输入')} />)}
          </FormItem>
        }
        <FormItem {...formItemLayout} label={i18n('check_rule', '校验规则')}>
          {getFieldDecorator('validation', {
            initialValue: validation || 'none',
            onChange: this.onChange
          })(
            <Select
              placeholder={i18n('globe.select', '请选择')}
              notFoundContent="没有发现"
              style={{ width: 335 }}
            >
              <Option value="none">{i18n('none_rule', '无校验')}</Option>
              <Option value="IP">{i18n('ip_address', 'IP地址')}</Option>
              <Option value="mobile">{i18n('mobile', '手机')}</Option>
              <Option value="reg">{i18n('reg', '正则表达式')}</Option>
            </Select>
          )}
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
        {filter === 'reg' && (
          <FormItem {...formItemLayout} label={i18n('reg', '正则表达式')}>
            {getFieldDecorator('reg', {
              initialValue: reg,
              rules: [
                {
                  required: true,
                  validator: this.handleValidator
                }
              ]
            })(<Input placeholder={i18n('field.conf.reg.tip', '列如:/^[0-9]*$/')} />)}
          </FormItem>
        )}
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: (props) => {
    props.onValuesChange && props.onValuesChange()
  }
})(SingleRowText)
