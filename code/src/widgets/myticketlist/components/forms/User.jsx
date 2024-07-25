import React, { Component } from 'react'
import { Form } from '@uyun/components'
import UserPicker from '../userPicker'
const FormItem = Form.Item

class User extends Component {
  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue, filterType, disabled } =
      this.props
    const isCurrent =
      !_.includes(['myfollow', 'mypartin'], filterType) &&
      _.includes(['executor', 'creator'], item.code)
    return (
      <FormItem {...formItemLayout} label={''}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <UserPicker
            isString
            size="small"
            extendFunc={isCurrent ? ['current'] : undefined}
            tabs={[1]}
            showTypes={['users']}
            placeholder={`请选择${item.name}`}
            disabled={
              disabled ||
              ((filterType === 'mytodo' || filterType === 'groupTodo') && item.code === 'executor')
            }
          />
        )}
      </FormItem>
    )
  }
}

export default User
