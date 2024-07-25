import React, { Component } from 'react'
import { Form } from '@uyun/components'
import UserPicker from '~/components/userPicker'
const FormItem = Form.Item

class Users extends Component {
  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue, modelId, fieldCode } = this.props
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue,
          getValueFromEvent: (value) => {
            if (_.isEmpty(value)) {
              return undefined
            }
            return value
          }
        })(
          <UserPicker
            tabs={[0, 1, 2, 3, 9]}
            showTypes={['groups', 'users', 'departs_custom', 'roles_custom', 'user_variable']}
            extendQuery={{ fieldCode: fieldCode, modelId }}
          />
        )}
      </FormItem>
    )
  }
}

export default Users
