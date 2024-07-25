import React, { Component } from 'react'
import { Form, Select, Input } from '@uyun/components'
import TagsInput from '~/components/tagsInput'
import { parseTagsDataToArray } from '~/utils/common'
import { matchReg } from '~/ticket/forms/utils/stringify'
import CommonConfig from '../../config/commonConfig'
import { Common } from '../index'
const FormItem = Form.Item
const Option = Select.Option
class Index extends Component {
  constructor(props) {
    super(props)

    this.validation = props.fieldData.validation || 'none'
    this.reg = props.fieldData.reg || ''
  }

  handleValidate = (rule, value, callback) => {
    value = parseTagsDataToArray(value)
    if (this.validation === 'none') {
      callback()
    } else if (value && value.length > 0) {
      let msg
      const error = value.some(item => {
        const { match, message } = matchReg(item, this.validation, this.reg)
        if (!match) {
          msg = message
          return true
        }
      })
      if (error) {
        callback(msg)
      } else {
        callback()
      }
    } else {
      callback()
    }
  }

  handleValidateReg = (rule, value, callback) => {
    if (!value) {
      callback(i18n('pls_input_reg', '请输入正则表达式'))
    } else {
      if (!(/^[\\/].*[\\/]$/).test(value)) {
        callback(i18n('pls_input_right_res', '请输入正确的正则表达式'))
      } else {
        callback()
      }
    }
  }

  handleRuleChange = (rule, value, callback) => {
    this.validation = value
    this.props.form.validateFields(['defaultValue'])
    callback()
  }

  handleRegChange = (e) => {
    this.reg = e.target.value
    this.props.form.validateFields(['defaultValue'])
  }

  render () {
    const { formItemLayout } = this.props
    const { getFieldDecorator, setFieldsValue, getFieldValue } = this.props.form
    const { reg, validation, builtin, defaultValue } = this.props.fieldData
    const diliver = _.merge({}, this.props, {
      getFieldDecorator,
      setFieldsValue,
      getFieldValue,
      config: CommonConfig
    })

    return (
      <Common {...diliver}>
        <FormItem {...formItemLayout} label={i18n('check_rule', '校验规则')}>
          {getFieldDecorator('validation', {
            initialValue: validation || 'none',
            // 第一次onChange无法校验到defaultValue
            // onChange: this.handleRuleChange,
            rules: [{
              validator: this.handleRuleChange
            }]
          })(
            <Select
              notFoundContent="没有发现"
              
            >
              <Option value="none">{i18n('none_rule', '无校验')}</Option>
              <Option value="IP">{i18n('ip_address', 'IP地址')}</Option>
              <Option value="mobile">{i18n('mobile', '手机')}</Option>
              <Option value="reg">{i18n('reg', '正则表达式')}</Option>
            </Select>
          )}
        </FormItem>
        {
          getFieldValue('validation') === 'reg' &&
            <FormItem {...formItemLayout} label={i18n('reg', '正则表达式')}>
              {getFieldDecorator('reg', {
                initialValue: reg,
                onChange: this.handleRegChange,
                rules: [{
                  required: true,
                  validator: this.handleValidateReg
                }]
              })(
                <Input placeholder={i18n('field.conf.reg.tip', '列如:/^[0-9]*$/')} />
              )}
            </FormItem>
        }
        <FormItem {...formItemLayout} label={i18n('default_value', '默认值')}>
          {
            getFieldDecorator('defaultValue', {
              initialValue: defaultValue,
              rules: [{
                validator: this.handleValidate
              }]
            })(<TagsInput />)
          }
        </FormItem>
      </Common>
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange()
  }
})(Index)
