import React, { Component } from 'react'
import { getTootipTitle, ArrayTypeToObjectKey, EXTEND_LIST } from './config'
import { Tooltip, Button } from '@uyun/components'
export default class UserPickerExtendButton extends Component {
  handleCurrent = (tabs) => {
    const { value, onChange } = this.props
    const tab = _.head(tabs)
    const key = ArrayTypeToObjectKey(tab)
    const currentData = _.find(EXTEND_LIST, (item) => item.type === key)

    const users = value.all.filter((item) => item.type === 'users')
    const groups = value.all.filter((item) => item.type === 'groups')
    const departs = value.all.filter((item) => item.type === 'departs')

    let falt = false
    // 防止多次点击
    switch (tab) {
      case 0:
        falt = _.some(groups, (group) => group.groupId === 'currentGroup')
        break
      case 1:
        falt = _.some(users, (user) => user.userId === 'currentUser')
        break
      case 2:
        falt = _.some(departs, (depart) => depart.id === 'currentDepart')
        break
      default:
        falt = false
    }

    // 防止多次点击
    if (falt) {
      return false
    }
    onChange(_.assign({}, value, { all: [...value.all, currentData] }))
  }

  render() {
    const { tabs, extendFunc = [], size = 'default', disabled } = this.props
    return (
      _.includes(extendFunc, 'current') && (
        <Tooltip title={getTootipTitle(tabs)}>
          <Button
            onClick={() => {
              this.handleCurrent(tabs)
            }}
            disabled={disabled}
            icon={<i className="iconfont icon-yonghu" />}
            size={size}
            style={{ width: 32 }}
          />
        </Tooltip>
      )
    )
  }
}
