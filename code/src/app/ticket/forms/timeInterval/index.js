import React, { Component } from 'react'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import Inner from './inner'

class TimeInterVal extends Component {
  handleCheck = (rule, value, callback) => {
    const { required } = rule
    const { field } = this.props
    if (required) {
      if (!value) {
        callback(`${i18n('ticket.forms.pinput', '请输入')}${field.name}`)
      } else {
        const { date, hour, minute } = value
        if (field.timeRule === '0' && hour && minute) {
          callback()
        } else if (field.timeRule === '1' && date && hour && minute) {
          callback()
        } else {
          callback(`${i18n('ticket.forms.pinput', '请输入')}${field.name}`)
        }
      }
    }
    callback()
  }

  _render() {
    const { timeRule, code } = this.props.field
    const values = this.props.getFieldValue && this.props.getFieldValue(code)
    const { date, hour, minute } = values
    if (timeRule === '0') {
      return `${hour || 0}${i18n('hours', '小时')}${minute || 0}${i18n('minute', '分钟')}`
    }
    return `${date || 0}${i18n('day', '天')}${hour || 0}${i18n('hours', '小时')}${
      minute || 0
    }${i18n('minute', '分钟')}`
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
      type,
      initialValue,
      popupContainerId,
      fieldMinCol,
      formLayoutType
    } = this.props
    const init =
      typeof initialValue === 'string' && initialValue !== '*********'
        ? JSON.parse(initialValue)
        : initialValue || {}
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: init,
          rules: [
            {
              type: 'object',
              required: +field.isRequired === 1,
              validator: (rule, value, callback) => {
                this.handleCheck(rule, value, callback)
              }
            }
          ],
          onChange: (value) => {
            this.props.changeTrigger && this.props.changeTrigger(field.code, value)
          }
        })(
          <Inner
            field={field}
            init={init}
            disabled={disabled}
            popupContainerId={popupContainerId}
          />
        )}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}
export default TimeInterVal
