import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { inject } from '@uyun/core'
import { Select, Tooltip } from '@uyun/components'
import { UserPickerPanel } from '@uyun/ec-user-picker'
import { UserPickStore } from '../../userpicker.store'
import {
  StoreConsumer,
  getUsers,
  getGroups,
  getDeparts,
  getDepartList,
  searchUsers
} from './config'
import DepartsPicker from './departsPicker'
import GroupPicker from './groupPicker'

const { Option } = Select

@observer
class Index extends Component {
  @inject(UserPickStore) store
  renderTag = (record) => (
    <Option title={<Tooltip title={record.name}>{record.name}</Tooltip>}>{record.name}</Option>
  )

  render() {
    const { extendQuery, method, selectionType, tabs, value, onChange, showTypes } = this.props
    const customShowTypes = []
    if (_.includes(showTypes, 'users')) {
      customShowTypes.push('users')
    }
    if (_.includes(showTypes, 'roles')) {
      customShowTypes.push('roles')
    }
    console.log('customShowTypes', customShowTypes)
    return (
      <UserPickerPanel
        value={value}
        onChange={onChange}
        selectionType={selectionType}
        showTypes={customShowTypes}
        getCombineData={async (params) =>
          await searchUsers(params, this.store, extendQuery, method, showTypes)
        }
        getUsers={async (params) => await getUsers(params, this.store, extendQuery, method)}
        getDeparts={async (params) => await getDeparts(params, this.store, extendQuery)}
        getDepartList={async (params) => await getDepartList(params, this.store, extendQuery)}
      >
        {showTypes.map((tab) => {
          const dilver = {
            value,
            onChange,
            key: tab,
            rowKey: 'id',
            selectionType,
            extendQuery,
            renderTag: this.renderTag,
            userPickStore: this.store
          }
          switch (tab) {
            case 'groups':
              return (
                <GroupPicker
                  {...dilver}
                  method={method}
                  rowKey="groupId"
                  type="groups"
                  tab={'用户组'}
                />
              )
            case 'departs_custom':
              return <DepartsPicker {...dilver} type="departs" tab={'部门'} />
          }
        })}
      </UserPickerPanel>
    )
  }
}
export default Index
