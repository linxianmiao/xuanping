import React, { Component } from 'react'
import { Input } from '@uyun/components'
import { stringify } from '../utils/stringify'
import { TextRecognitionHttp } from '../utils/scriptfunc'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import TextPreview from '~/components/TextPreview'
// import { FormDebounceInput } from './../../../components/FormController/index'

const TextArea = Input.TextArea

class MultiRowText extends Component {
  handleCheckMultiRowText = (rule, value, callback) => {
    const { field, globalRegular, secrecy } = this.props
    value = _.trim(value) || ''
    if (rule.required && value === '') {
      callback(`${i18n('ticket.forms.pinput', '请输入')}${field.name}`)
    } else if (value && value.length < rule.min) {
      callback(
        `${field.name}${i18n('ticket.forms.below', '不能低于')}${field.minLength}${i18n(
          'ticket.forms.character',
          '字符'
        )}`
      )
    } else if (value && value.length > rule.max) {
      callback(
        `${field.name}${i18n('ticket.forms.beyond', '不能高于')}${rule.max}${i18n(
          'ticket.forms.character',
          '字符'
        )}`
      )
    } else if (value) {
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

  disabledRender = () => {
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
    if (type !== 'config' && disabled) {
      return (
        <div>
          <TextPreview field={field} uuId={field.code} className="pre-wrap disabled-ticket-form">
            {this.disabledRender()}
          </TextPreview>
        </div>
      )
    }
    return null
  }

  render() {
    const {
      fieldMinCol,
      field,
      getFieldDecorator,
      disabled,
      type,
      targetWrapper,
      secrecy,
      source,
      initialValue,
      formLayoutType,
      onblur = () => {}
    } = this.props
    let defaultValue = ''
    if (source === 'trigger') {
      if (field.code === 'ticketDesc' && this.props.forms) {
        defaultValue = !_.isEmpty(initialValue) ? `${initialValue}` : this.props.forms.ticketDesc
      } else {
        defaultValue = initialValue
      }
    } else {
      if (field.code === 'ticketDesc' && this.props.forms) {
        defaultValue = !_.isEmpty(field.defaultValue)
          ? `${field.defaultValue}`
          : this.props.forms.ticketDesc
      } else {
        defaultValue = field.defaultValue
      }
    }
    defaultValue =
      typeof defaultValue === 'string' || _.isEmpty(defaultValue)
        ? defaultValue
        : stringify(defaultValue)
    let dilver = {}
    // if (!disabled && field.maxLength) {
    //   dilver = {
    //     maxLength: field.isRequired === 2 ? undefined : field.maxLength || 1000
    //   }
    // }
    const componentProps = {
      ...dilver,
      className: classnames({
        'disabled-item': disabled
      }),
      disabled: field.isRequired === 2,
      id: field.code,
      autosize: field.maxRowHeight ? { minRows: 2, maxRows: field.maxRowHeight } : undefined,
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
    return (
      <FormItem
        fieldMinCol={fieldMinCol}
        field={field}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: defaultValue || undefined,
          rules: disabled
            ? [{ required: +field.isRequired === 1 }]
            : [
                {
                  type: 'string',
                  whitespace: true,
                  required: +field.isRequired === 1,
                  min: field.minLength ? field.minLength : 0,
                  max: field.maxLength || 1000,
                  validator: (rule, value, callback) => {
                    this.handleCheckMultiRowText(rule, value, callback)
                  }
                }
              ]
        })(
          targetWrapper ? (
            targetWrapper({
              code: field.code,
              props: componentProps,
              component: TextArea
            })
          ) : (
            // <FormDebounceInput code={field.code}>
            <TextArea {...componentProps} />
            // </FormDebounceInput>
          )
        )}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}

export default MultiRowText
