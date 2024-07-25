import React, { Component } from 'react'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import JSONText from './JSONText'
import { validJson } from '../utils/validatorField'

export default class JSONTextField extends Component {
  validator = (rule, value, callback) => {
    const { required } = rule
    const { name } = this.props.field
    const { isError, errorMes } = validJson({ required, name }, value)

    if (isError) {
      callback(errorMes)
    } else {
      callback()
    }
  }

  render() {
    const { field, getFieldDecorator, disabled, fieldMinCol, secrecy, formLayoutType } = this.props
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames({
          'table-style-item': formLayoutType
        })}
      >
        {getFieldDecorator(field.code, {
          initialValue: field.defaultValue || undefined,
          rules: [
            {
              required: +field.isRequired === 1,
              validator: this.validator
            }
          ]
        })(secrecy ? <Secrecy /> : <JSONText disabled={disabled} id={field.code} />)}
      </FormItem>
    )
  }
}
