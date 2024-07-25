import React, { Component } from 'react'
import { Form } from '@uyun/components'
import UserPicker from '../userPicker'
const FormItem = Form.Item

class User extends Component {
  render() {
    const {
      formItemLayout,
      item,
      getFieldDecorator,
      defaultValue,
      filterType,
      typeList,
      size = 'default'
    } = this.props
    // 处理组可以选当前用户所在用户组
    const isCurrent = !_.includes(typeList, filterType) && _.includes(['executionGroup'], item.code)
    return (
      <FormItem {...formItemLayout} label={item.name}>
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <UserPicker
            isString
            size={size}
            selectionType="radio"
            tabs={[0]}
            showTypes={['groups']}
            extendFunc={isCurrent ? ['current'] : undefined}
            disabled={filterType === 'groupTodo' && item.code === 'executionGroup'}
            popupContainerId="itsm-wrap"
            modalTitle={'用户组选择'}
          />
        )}
      </FormItem>
    )
  }
}

export default User
