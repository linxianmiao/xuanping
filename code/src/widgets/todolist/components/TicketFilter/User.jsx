import React, { Component } from 'react'
import { Form } from '@uyun/components'
import { observer } from 'mobx-react'
import UserFilter from './itsmUsers'
const FormItem = Form.Item

@observer
class User extends Component {
  render() {
    const { formItemLayout, item, getFieldDecorator } = this.props
    return (
      <FormItem {...formItemLayout}
        label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: undefined
        })(
          <UserFilter
            isString
            size="small"
            selectsType={{
              1: 'radio'
            }}
            viewType="input"
            defaultTab="1"
            tabs={['1']}
          />)}
      </FormItem>
    )
  }
}

export default User
