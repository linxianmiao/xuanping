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
      filterType,
      typeList,
      size = 'default',
      disabled,
      label,
      noLabel = false,
      handleChange = () => {}
    } = this.props
    // 创建人，处理人可以选当前用户
    const isCurrent =
      !_.includes(typeList, filterType) && _.includes(['executor', 'creator'], item.code)
    // 待办，参与，关注单选
    const selectionType = !_.includes(typeList, filterType) ? 'checkBox' : 'radio'
    return (
      <FormItem
        {...formItemLayout}
        label={noLabel ? '' : label || item.name}
        className="filter-item-user  filter-item-select"
      >
        {getFieldDecorator(item.code, {
          initialValue: defaultValue
        })(
          <UserPicker
            isString
            size={size}
            selectionType={selectionType}
            extendFunc={isCurrent ? ['current'] : undefined}
            tabs={[1]}
            showTypes={['users']}
            disabled={
              disabled ||
              ((filterType === 'myToDo' || filterType === 'groupTodo') && item.code === 'executor')
            }
            popupContainerId="itsm-wrap"
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
