import React, { Component } from 'react'
import classnames from 'classnames'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
import Table from './table'

export default class CustomizeTable extends Component {
  render() {
    const {
      field,
      getFieldDecorator,
      initialValue,
      disabled,
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
          ]
        })(secrecy ? <Secrecy /> : <Table disabled={disabled} fieldCode={field.code} />)}
      </FormItem>
    )
  }
}
