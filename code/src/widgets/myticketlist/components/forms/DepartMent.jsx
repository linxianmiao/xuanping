import React, { Component } from 'react'
import { Form } from '@uyun/components'
import UserPicker from '../userPicker'
const FormItem = Form.Item

class User extends Component {
  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue, disabled } = this.props
    // 创建人所在部门可以选择当前用户
    const isCurrent = _.includes(['filterOrg'], item.code)
    return (
      <FormItem {...formItemLayout} label={''}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <UserPicker
            disabled={disabled}
            isString
            tabs={[2]}
            showTypes={['departs_custom']}
            selectsType="radio"
            size="small"
            extendFunc={isCurrent ? ['current'] : undefined}
            modalTitle={'部门选择'}
            placeholder={`请选择${item.name}`}
          />
        )}
      </FormItem>
    )
  }
}

export default User
