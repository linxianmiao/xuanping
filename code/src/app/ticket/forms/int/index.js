import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { InputNumber } from '@uyun/components'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import classnames from 'classnames'

class Int extends Component {
  handleCheckInt = (rule, value, callback) => {
    const { field } = this.props
    if (rule.required && (value === undefined || value === null)) {
      callback(`${i18n('ticket.forms.pinput', '请输入')}${field.name}`)
    } else if (typeof value === 'number' && typeof rule.max === 'number' && value > rule.max) {
      callback(`${field.name}${i18n('ticket.forms.beyond', '不能超出')}${field.intMax}`)
    } else if (typeof value === 'number' && typeof rule.min === 'number' && value < rule.min) {
      callback(`${field.name}${i18n('ticket.forms.below', '不能低于')}${field.intMin}`)
    } else {
      callback()
    }
  }

  _render = () => {
    const { field, getFieldValue } = this.props
    return `${getFieldValue(field.code) ?? ''} ${field.unit || '--'}`
  }

  renderReadOnly() {
    const { secrecy, type, disabled, field } = this.props

    if (secrecy) {
      return <Secrecy />
    }
    if (!disabled) {
      return <span style={{ marginLeft: 5 }}>{field.unit}</span>
    }
    if (type !== 'config' && disabled) {
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
      fieldMinCol,
      targetWrapper,
      formLayoutType
    } = this.props

    const componentProps = {
      className: classnames({
        'disabled-item': disabled
      }),
      id: field.code,
      disabled: field.isRequired === 2,
      precision: 0
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
          'table-style-item': formLayoutType,
          numberWrap: true
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: newInival,
          rules: disabled
            ? [{ required: +field.isRequired === 1 }]
            : [
                {
                  type: 'integer',
                  required: +field.isRequired === 1,
                  min: field.intMin,
                  max: field.intMax,
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
Int.propTypes = {
  initialValue: PropTypes.string
}
export default Int
