import React, { Component } from 'react'
import moment from 'moment'
import { Input } from '@uyun/components'
import classnames from 'classnames'
import { stringify, matchReg } from '../utils/stringify'
import { TextRecognitionHttp } from '../utils/scriptfunc'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import _ from 'lodash'
// import { FormDebounceInput } from './../../../components/FormController/index'

const defaultMaxLength = 500

class SingleRowText extends Component {
  handleCheckSingleRowText = (rule, value, callback) => {
    const { field, globalRegular, secrecy } = this.props
    value = value || ''
    value = _.trim(value)
    if (rule.required && !value) {
      callback(`${i18n('ticket.forms.pinput', '请输入')}${field.name}`)
    } else if (value && rule.max && value.length > rule.max) {
      callback(
        `${field.name}${i18n('ticket.forms.beyond', '不能超出')}${field.maxLength}${i18n(
          'ticket.forms.character',
          '字符'
        )}`
      )
    } else if (value && value.length < rule.min) {
      callback(
        `${field.name}${i18n('ticket.forms.below', '不能低于')}${field.minLength}${i18n(
          'ticket.forms.character',
          '字符'
        )}`
      )
    } else if (value) {
      const { match, message } = matchReg(value, field.validation, field.reg)

      if (!match) {
        callback(message)
      }
      if (globalRegular) {
        if (field.privacy) callback()
        if (field.fieldPrivacy === 1) callback()
        if (secrecy) callback()
        _.map(globalRegular, (item) => {
          const reg = eval(item.field_regularization)
          let match = reg.test(value)
          if (item.type === 0) match = !match
          if (!match) callback(item.name)
        })
      }
      callback()
    } else {
      callback()
    }
  }

  _render = () => {
    const text = this.props.getFieldValue && this.props.getFieldValue(this.props.field.code)
    if (text) {
      return TextRecognitionHttp(text)
    }
    return '--'
  }

  renderReadOnly() {
    const { secrecy, type, disabled, field } = this.props
    if (secrecy) {
      return <Secrecy />
    }
    if ((type !== 'config' && disabled) || field.type === 'ticketField') {
      return <div className="pre-wrap disabled-ticket-form">{this._render()}</div>
    }
    return null
  }
  renderTicketFields = () => {
    const { field, forms, source } = this.props

    let defaultVal = ''
    switch (field.code) {
      case 'flowNo':
        defaultVal = source === 'formset' ? 'SNYYYYMMDD' : forms?.ticketNum
        break
      case 'modelName':
        defaultVal = source === 'formset' ? '模型名称' : forms?.modelName
        break
      case 'createTime':
        if (forms) {
          let createTime = forms.createTime
          defaultVal = moment(createTime)
            .utc(moment(createTime).zone())
            .format('YYYY-MM-DD HH:mm:ss')
        } else {
          defaultVal = 'YYYY-MM-DD HH:mm:ss'
        }
        break
      case 'status':
        let status = forms?.status
        switch (status) {
          case 1:
            defaultVal = '待处理'
            break
          case 2:
            defaultVal = '处理中'
            break
          case 3:
            defaultVal = '已完成'
            break
          case 7:
            defaultVal = '已关闭'
            break
          case 10:
            defaultVal = '已挂起'
            break
          case 11:
            defaultVal = '已废除'
            break
          case 12:
            defaultVal = '已处理'
            break
          default:
            defaultVal = '当前状态'
            break
        }
        break
      default:
        break
    }
    return defaultVal
  }
  render() {
    const {
      field,
      getFieldDecorator,
      disabled,
      initialValue,
      fieldMinCol,
      targetWrapper,
      formLayoutType,
      onblur = () => {}
    } = this.props
    // 标题与描述放在不放default里
    let defaultVal =
      typeof initialValue === 'string' || _.isEmpty(initialValue)
        ? initialValue
        : stringify(initialValue)
    if (['title', 'ticketDesc'].indexOf(field.code) !== -1 && this.props.forms) {
      defaultVal = defaultVal || this.props.forms[field.code]
    }
    const isTicketField = field.type === 'ticketField'
    const componentProps = {
      className: classnames({
        'disabled-item': disabled || isTicketField,
        'ticket-field-item': isTicketField
      }),
      id: field.code,
      maxLength: field.isRequired === 2 ? undefined : field.maxLength || defaultMaxLength,
      disabled: (field.code === 'flowNoBuiltIn' || field.isRequired === 2) && !isTicketField,
      placeholder:
        field.isRequired === 2
          ? ''
          : field.placeholder
          ? field.fieldDesc
          : i18n('please-input', '请输入'),
      onBlur: () => {
        onblur(field)
      }
    }
    //流程字段初始值赋值
    if (field.type === 'ticketField') {
      defaultVal = this.renderTicketFields()
    }
    //srvItemName需要从服务目录组件建单时传递进来
    if (field.code === 'srvItemName' && !_.isEmpty(this.props?.locationQuery?.srvItemName)) {
      defaultVal = this.props?.locationQuery?.srvItemName
    }
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType,
          'ticket-field': isTicketField
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: defaultVal || undefined,
          rules: [
            {
              type: 'string',
              required: +field.isRequired === 1,
              whitespace: true,
              max: field.maxLength || defaultMaxLength,
              min: field.minLength || 0,
              validator: (rule, value, callback) => {
                this.handleCheckSingleRowText(rule, value, callback)
              }
            }
          ]
        })(
          targetWrapper ? (
            targetWrapper({
              code: field.code,
              props: componentProps,
              component: Input
            })
          ) : (
            // <FormDebounceInput code={field.code}>
            <Input {...componentProps} />
            // </FormDebounceInput>
          )
        )}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}

export default SingleRowText
