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
    // 处理组可以选当前用户所在用户组
    const isCurrent = !_.includes(typeList, filterType) && _.includes(['executionGroup'], item.code)
    return (
      <FormItem
        {...formItemLayout}
        label={noLabel ? '' : label || item.name}
        className="filter-item-user filter-item-select"
      >
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
            disabled={
              disabled ||
              ((filterType === 'myToDo' || filterType === 'groupTodo') &&
                item.code === 'executionGroup')
            }
            popupContainerId="itsm-wrap"
            readOnlyClass="search"
            onChange={(value) => {
              handleChange({ [item.code]: value })
            }}
            placeholder={noLabel && `请选择${item.name}`}
            modalTitle={'用户组选择'}
          />
        )}
      </FormItem>
    )
  }
}

export default User
