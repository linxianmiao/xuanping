import React, { Component } from 'react'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import RichText from './RichText'

export default class RichTextField extends Component {
  handleCheckRichText = (rule, value, callback) => {
    const { field, globalRegular, secrecy } = this.props
    value = value || ''
    if (rule.required && !value) {
      callback(`${i18n('ticket.forms.pinput', '请输入')}${field.name}`)
    } else if (value) {
      if (globalRegular) {
        if (field.privacy) callback()
        if (field.fieldPrivacy === 1) callback()
        if (secrecy) callback()
        const content = value.replace(/<.+?>/g, '')
        _.map(globalRegular, (item) => {
          const reg = eval(item.field_regularization)
          let match = reg.test(content)
          if (item.type === 0) match = !match
          if (!match) callback(item.name)
        })
      }
      callback()
    } else {
      callback()
    }
  }

  render() {
    const {
      getFieldDecorator,
      field,
      disabled,
      ticketId,
      fieldMinCol,
      secrecy,
      source,
      initialValue,
      formLayoutType
    } = this.props
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: (source === 'trigger' ? initialValue : field.defaultValue) || undefined,
          rules: [
            {
              required: +field.isRequired === 1,
              //   message: `${i18n('ticket.forms.pinput', '请输入')}${field.name}`,
              validator: (rule, value, callback) => {
                this.handleCheckRichText(rule, value, callback)
              }
            }
          ]
        })(
          secrecy ? (
            <Secrecy />
          ) : (
            <RichText
              id={field.code}
              placeholder={
                field.isRequired === 2
                  ? ''
                  : field.placeholder
                  ? field.fieldDesc
                  : i18n('please-input', '请输入')
              }
              disabled={disabled || field.isRequired === 2}
              ticketId={ticketId}
              field={field}
            />
          )
        )}
      </FormItem>
    )
  }
}
