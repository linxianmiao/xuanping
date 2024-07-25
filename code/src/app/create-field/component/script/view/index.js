import React, { Component } from 'react'
import FormItem from '../../../../ticket/forms/components/formItem'
import Secrecy from '../../../../ticket/forms/components/Secrecy'
import _ from 'lodash'
import { Form } from '@uyun/components'
import Picker from './picker'
export class Script extends Component {
  static defaultProps = {
    value: [], // 当前字段的value,格式不定
    onChange: () => {}, // 修改字段的value方法
    field: {}, // 字段的对象
    forms: {}, // 工单得对象，可以获取工单id，模型id，处理人等信息
    preview: false, // 是否时预览，部分字段预览时不可编辑
    allValue: {}, // 表单中所有字段得值，为{[code]:value}模式
    setFieldsValue: () => {} // 同 antd 的 setFieldsValue ，用来修改表单中其他的值 请勿乱用
  }

  validator = (rules, value, callback) => {
    if (value.length === 0) {
      callback('请选择脚本')
    } else {
      callback()
    }
  }

  render() {
    const {
      field,
      getFieldDecorator,
      initialValue,
      disabled,
      value,
      fieldMinCol,
      form,
      forms,
      type,
      secrecy,
      onChange
    } = this.props
    const { setFieldsValue, getFieldsValue } = form

    let prevValue = null
    let formatedValue
    let allValue = getFieldsValue()
    try {
      // 字符串解析
      formatedValue = typeof value === 'string' ? JSON.parse(value) : value
    } catch (e) {
      formatedValue = []
    }
    // 解析之后不是数组
    if (!Array.isArray(value)) {
      formatedValue = []
    }
    return (
      <FormItem field={field} fieldMinCol={fieldMinCol} getFieldDecorator={getFieldDecorator}>
        {getFieldDecorator(field.code, {
          initialValue: initialValue,
          rules: [
            {
              required: +field.isRequired === 1,
              validator: this.validator
            }
          ],
          // validateTrigger: _.get(customField, 'validateTrigger') || 'onChange',
          normalize: (value, prevVal, allValues) => {
            prevValue = prevVal
            allValue = _.assign({}, allValue, allValues)
            return value
          }
        })(
          secrecy ? (
            <Secrecy />
          ) : (
            <Picker value={formatedValue} disabled={disabled} onChange={(data) => onChange(data)} />
          )
        )}
      </FormItem>
    )
  }
}

export default Form.create({
  onValuesChange: (props) => {
    props.onValuesChange && props.onValuesChange()
  }
})(Script)
