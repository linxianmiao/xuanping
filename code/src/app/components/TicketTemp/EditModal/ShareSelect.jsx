import React, { Component } from 'react'
import { Radio } from '@uyun/components'
import UserPicker from '~/components/userPicker'

const RadioGroup = Radio.Group

/**
 * 服务端的value的格式 { all: value }
 *  key: 'all', 'group', 'role', 'department'
 *  value: id[]
 *
 * 组件中的value的格式 radio: 0所有用户, 1部分用户
 */
export default class ShareSelect extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedUserInfo: props.selectedUserInfo || []
    }
  }

  handleRadioChange = (val) => {
    const { value, onChange } = this.props
    const nextValue = { ...value }

    if (val === 1) {
      nextValue.all = []
    } else if (val === 0) {
      Reflect.deleteProperty(nextValue, 'all')
    }

    onChange(nextValue)
  }

  handleUsersChange = (val) => {
    this.setState({ selectedUserInfo: val })

    const groupIds = []
    const departmentIds = []
    const roleIds = []

    val.forEach((item) => {
      if (item.type === 0) groupIds.push(item.id)
      if (item.type === 2) departmentIds.push(item.id)
      if (item.type === 3) roleIds.push(item.id)
    })

    const nextValue = {
      group: groupIds,
      department: departmentIds,
      role: roleIds
    }

    this.props.onChange(nextValue)
  }

  getUserValueFromProps = () => {
    const { value = {} } = this.props
    const { selectedUserInfo } = this.state
    const nextValue = []

    Object.keys(value).forEach((key) => {
      if (key !== 'all') {
        value[key].forEach((id) => {
          const item = selectedUserInfo.find((it) => it.id === id)

          if (item) {
            nextValue.push(item)
          }
        })
      }
    })

    return nextValue
  }

  render() {
    const radio = Reflect.has(this.props.value, 'all') ? 1 : 0

    return (
      <div>
        <RadioGroup value={radio} onChange={(e) => this.handleRadioChange(e.target.value)}>
          <Radio value={1}>{i18n('all.users', '所有用户')}</Radio>
          <Radio value={0}>{i18n('some.users', '部分用户')}</Radio>
        </RadioGroup>

        {radio === 0 && (
          <UserPicker
            tabs={[0, 2, 3]}
            showTypes={['groups', 'departs_custom', 'roles_custom']}
            zIndex={1020}
            value={this.getUserValueFromProps()}
            onChange={this.handleUsersChange}
          />
        )}
      </div>
    )
  }
}
