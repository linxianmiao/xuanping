import React, { Component } from 'react'
import classnames from 'classnames'
import PwdInner from './inner'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'

class Password extends Component {
  state = {
    hasDefault: !!this.props.initialValue
  }

  handleCheckPwd = (rule, value, callback) => {
    const { field } = this.props
    if (value === '*********') {
      callback()
    }
    value = value ? _.trim(value) : ''
    if (!value && rule.required && !this.state.hasDefault) {
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
    } else {
      callback()
    }
  }

  changehasDefault = () => {
    if (this.state.hasDefault) {
      this.setState({ hasDefault: false })
    }
  }

  _render = () => {
    return this.props.initialValue || '--'
  }

  renderReadOnly() {
    const { secrecy, type, disabled } = this.props

    if (secrecy) {
      return <Secrecy />
    }
    if (type !== 'config' && disabled) {
      return <div className="pre-wrap disabled-ticket-form">{this._render()}</div>
    }
    return null
  }

  render() {
    const {
      field,
      getFieldDecorator,
      disabled,
      initialValue,
      type,
      fieldMinCol,
      secrecy,
      form,
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
          initialValue: initialValue,
          rules:
            disabled || field.isRequired === 2
              ? [{ required: +field.isRequired === 1 }]
              : [
                  {
                    whitespace: true,
                    max: field.maxLength,
                    min: field.minLength,
                    required: +field.isRequired === 1,
                    validator: (rule, value, callback) => {
                      this.handleCheckPwd(rule, value, callback)
                    }
                  }
                ]
        })(
          <PwdInner
            id={field.code}
            disabled={disabled}
            value={
              !_.isEmpty(form)
                ? form?.getFieldValue(field.code)
                : this.props?.getFieldValue(field.code)
            }
            changehasDefault={this.changehasDefault}
            secrecy={secrecy}
          />
        )}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}

export default Password
