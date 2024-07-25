import React, { Component } from 'react'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import { Button } from '@uyun/components'
import classnames from 'classnames'
export default class Btn extends Component {
  render() {
    const { field, getFieldDecorator, disabled, fieldMinCol, secrecy, formLayoutType } = this.props
    const { btnVerticalLayout } = field
    return (
      <FormItem
        field={field}
        fieldMinCol={fieldMinCol}
        className={classnames('btn-form-wrap', {
          'table-style-item': formLayoutType,
          'btn-item': true,
          'top-btn': btnVerticalLayout === 'top',
          'middle-btn': btnVerticalLayout === 'middle',
          'bottom-btn': btnVerticalLayout === 'bottom'
        })}
      >
        {getFieldDecorator(field.code)(
          secrecy ? (
            <Secrecy />
          ) : (
            <Button
              disabled={field.isRequired === 2}
              onClick={
                typeof this.props.btnClick === 'function' && (() => this.props.btnClick(field.code))
              }
            >
              {field.name}
            </Button>
          )
        )}
      </FormItem>
    )
  }
}
