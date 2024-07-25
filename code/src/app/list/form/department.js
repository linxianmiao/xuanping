import React, { Component } from 'react'
import { Form } from '@uyun/components'
import UserPicker from '~/components/userPicker'
const FormItem = Form.Item

class User extends Component {
  render() {
    const {
      formItemLayout,
      item,
      getFieldDecorator,
      defaultValue,
      size = 'default',
      disabled,
      label,
      noLabel = false,
      handleChange = () => {}
    } = this.props
    // 创建人所在部门、参与人所在部门 可以选择当前用户
    const isCurrent = window.ticket_department_switch || _.includes(['filterOrg'], item.code)
    return (
      <FormItem
        {...formItemLayout}
        label={noLabel ? '' : label || item.name}
        className="filter-item-user filter-item-select"
      >
        {getFieldDecorator(item.code, {
          initialValue: defaultValue || undefined
        })(
          <UserPicker
            disabled={disabled}
            isString
            size={size}
            tabs={[2]}
            showTypes={['departs_custom']}
            modalTitle={'部门选择'}
            selectsType="radio"
            extendFunc={isCurrent ? ['current'] : undefined}
            readOnlyClass="search"
            onChange={(value) => {
              handleChange({ [item.code]: value })
            }}
            placeholder={noLabel && `请选择${item.name}`}
          />
        )}
      </FormItem>
    )
  }
}

export default User
