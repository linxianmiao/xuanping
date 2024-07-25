import React, { Component } from 'react'
import { Form } from '@uyun/components'
import UserSelect from './userSelect'
const FormItem = Form.Item

class Jump extends Component {
  render() {
    const { form, tacheList, ...rest } = this.props
    const { getFieldDecorator, setFieldsValue } = form
    const dilver = {
      setFieldsValue,
      ...rest
    }
    return (
      <Form>
        {_.map(tacheList, tache => {
          return (
            <FormItem label={tache.tacheName}>
              {getFieldDecorator(tache.tacheId, {
                initialValue: undefined
              })(
                <UserSelect {...dilver} code={tache.tacheId} />
              )}
            </FormItem>
          )
        })}
      </Form>
    )
  }
}

export default Form.create()(Jump)
