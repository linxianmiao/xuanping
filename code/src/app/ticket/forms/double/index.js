import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { InputNumber } from '@uyun/components'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'

class Float extends Component {
  handleCheckInt = (rule, value, callback) => {
    const { field } = this.props
    if (rule.required && (value === undefined || value === null)) {
      callback(`${i18n('ticket.forms.pinput', '请输入')}${field.name}`)
    } else if (typeof value === 'number' && typeof rule.max === 'number' && value > rule.max) {
      callback(`${field.name}${i18n('ticket.forms.beyond', '不能超出')}${field.doubleMax}`)
    } else if (typeof value === 'number' && typeof rule.min === 'number' && value < rule.min) {
      callback(`${field.name}${i18n('ticket.forms.below', '不能低于')}${field.doubleMin}`)
    } else {
      callback()
    }
  }

  _render = () => {
    const { field, getFieldValue } = this.props
    const defaultVal = getFieldValue(field.code)
    return `${defaultVal ?? ''} ${field.unit || '--'}`
  }

  renderReadOnly() {
    const { secrecy, type, disabled, field, getFieldValue } = this.props

    if (secrecy) {
      return <Secrecy />
    }
    if (!disabled) {
      return <span>{field.unit}</span>
    }
    if (type !== 'config ' && disabled) {
      return <span className="pre-wrap disabled-ticket-form">{this._render()}</span>
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
      targetWrapper,
      getFieldValue,
      secrecy,
      formLayoutType
    } = this.props

    const componentProps = {
      className: classnames({
        'disabled-item': disabled
      }),
      id: field.code,
      disabled: field.isRequired === 2,
      step: 1 / Math.pow(10, field.precision)
    }

    if (field.precision) {
      componentProps.precision = field.precision
    }
    let newInival
    if (_.isString(initialValue) && !_.isEmpty(initialValue) && !isNaN(Number(initialValue))) {
      newInival = Number(initialValue)
    } else if (_.isNumber(initialValue)) {
      newInival = initialValue
    } else {
      newInival = undefined
    }
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: newInival,
          rules: disabled
            ? [{ required: +field.isRequired === 1 }]
            : [
                {
                  type: 'float',
                  required: +field.isRequired === 1,
                  min: field.doubleMin,
                  max: field.doubleMax,
                  validator: (rule, value, callback) => {
                    this.handleCheckInt(rule, value, callback)
                  }
                }
              ]
        })(
          targetWrapper ? (
            targetWrapper({
              code: field.code,
              props: componentProps,
              component: InputNumber
            })
          ) : (
            <InputNumber {...componentProps} />
          )
        )}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}
Float.propTypes = {
  initialValue: PropTypes.string.isRequired
}
export default Float
