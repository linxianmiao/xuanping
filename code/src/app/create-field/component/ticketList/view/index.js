import React, { Component } from 'react'
import { Form } from '@uyun/components'
import FormItem from '../../../../ticket/forms/components/formItem'
import Secrecy from '../../../../ticket/forms/components/Secrecy'
import TickList from '../ticketList'

export class TicketList extends Component {
  tickList = React.createRef()

  static defaultProps = {
    value: undefined, // 当前字段的value,格式不定
    onChange: () => {}, // 修改字段的value方法
    field: {}, // 字段的对象
    forms: {}, // 工单得对象，可以获取工单id，模型id，处理人等信息
    preview: false, // 是否时预览，部分字段预览时不可编辑
    allValue: {}, // 表单中所有字段得值，为{[code]:value}模式
    setFieldsValue: () => {} // 同 antd 的 setFieldsValue ，用来修改表单中其他的值 请勿乱用
  }

  // 校验触发两次（疑点）
  validator = (rule, value, callback) => {
    if (this.view && _.isFunction(this.view.validator)) {
      this.view.validator(rule, value, callback)
    } else {
      if (rule.required && !value) {
        callback(`${i18n('globe.select', '请选择')}${this.props.field.name}`)
      } else {
        callback()
      }
    }
  }

  onChange = (e) => {
    this.props.onChange(e.target.value)
  }

  render () {
    const { field, getFieldDecorator, initialValue, disabled, fieldMinCol, form, forms, type, secrecy } = this.props
    const { setFieldsValue, getFieldsValue } = form

    let prevValue = null
    let allValue = getFieldsValue()
    return (
      <FormItem field={field} fieldMinCol={fieldMinCol}>
        {getFieldDecorator(field.code, {
          initialValue: initialValue,
          rules: [{
            required: +field.isRequired === 1,
            validator: this.validator
          }],
          // validateTrigger: _.get(customField, 'validateTrigger') || 'onChange',
          normalize: (value, prevVal, allValues) => {
            prevValue = prevVal
            allValue = _.assign({}, allValue, allValues)
            return value
          }
        })(
          secrecy ? <Secrecy />
            : <TickList {...this.props} ref={this.tickList} />
        )}
      </FormItem>
    )
  }
}

export default Form.create({
  onValuesChange: props => {
    props.onValuesChange && props.onValuesChange()
  }
})(TicketList)
