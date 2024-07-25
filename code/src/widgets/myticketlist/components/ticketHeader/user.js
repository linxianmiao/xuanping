import React, { Component } from 'react'
import { Form } from '@uyun/components'
import { observer } from 'mobx-react'
const FormItem = Form.Item

@observer
class User extends Component {
  render() {
    const { formItemLayout, item, getFieldDecorator } = this.props
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: undefined
        })(<div />)}
      </FormItem>
    )
  }
}

export default User
