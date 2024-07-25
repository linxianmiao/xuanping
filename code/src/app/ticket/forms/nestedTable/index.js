import React, { Component } from 'react'
import { Input } from '@uyun/components'
import FormItem from '../components/formItem'
import Secrecy from '../components/Secrecy'
export default class Btn extends Component {
  render() {
    const { field, getFieldDecorator, fieldMinCol, secrecy } = this.props
    console.log(field, 'nestedTable')
    return (
      <FormItem field={field} fieldMinCol={fieldMinCol}>
        {getFieldDecorator(field.code)(
          secrecy ? (
            <Secrecy />
          ) : (
            <Input disabled readOnly defaultValue={`(嵌套表格必须放置在表格里)`}></Input>
          )
        )}
      </FormItem>
    )
  }
}
