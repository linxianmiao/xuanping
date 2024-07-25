import React, { Component } from 'react'
import { Checkbox } from '@uyun/components'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
const CheckboxGroup = Checkbox.Group

class MultiSel extends Component {
  _render = () => {
    const { field, getFieldValue } = this.props
    const { params } = field
    const initialValue = getFieldValue(field.code) || []
    if (initialValue.length === 0) {
      return '--'
    }
    return _.chain(params)
      .filter((item) => _.includes(initialValue, item.value))
      .sortBy((item) => initialValue.indexOf(item.value))
      .map((item) => item.label)
      .toString()
      .value()
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
      fieldMinCol,
      secrecy,
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
          rules: [
            {
              required: +field.isRequired === 1,
              message: `${i18n('globe.select', '请选择')}${field.name}`
            }
          ],
          onChange: (value) => {
            this.props.changeTrigger && this.props.changeTrigger(field.code, value)
          }
        })(
          <CheckboxGroup
            className={classnames({
              'disabled-item': disabled
            })}
            id={field.code}
            disabled={disabled}
          >
            {_.map(field.params, (item) => (
              <Checkbox key={item.value} value={item.value}>
                {item.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        )}
        {this.renderReadOnly()}
      </FormItem>
    )
  }
}

export default MultiSel
