import React, { Component } from 'react'
import { Form } from '@uyun/components'
import UserPicker from '../userPicker'
const FormItem = Form.Item

class User extends Component {
  render() {
    const { formItemLayout, item, getFieldDecorator, defaultValue, filterType, disabled } =
      this.props
    // 处理组可以选当前用户所在用户组
    const isCurrent =
      !_.includes(['myfollow', 'mypartin'], filterType) && _.includes(['executionGroup'], item.code)
    return (
      <FormItem {...formItemLayout} label={''}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <UserPicker
            disabled={
              disabled ||
              ((filterType === 'myToDo' || filterType === 'groupTodo') &&
                item.code === 'executionGroup')
            }
            isString
            selectionType="radio"
            size="small"
            tabs={[0]}
            showTypes={['groups']}
            placeholder={`请选择${item.name}`}
            extendFunc={isCurrent ? ['current'] : undefined}
          />
        )}
      </FormItem>
    )
  }
}

export default User
