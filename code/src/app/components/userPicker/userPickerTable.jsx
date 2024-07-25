import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { store as runtimeStore } from '@uyun/runtime-react'
import { Select, Tooltip } from '@uyun/components'
import { UserPickerPanel } from '@uyun/ec-user-picker'
import {
  StoreConsumer,
  getUsers,
  getGroups,
  getDeparts,
  getDepartList,
  searchUsers
} from './config'
import DepartsPicker from './departsPicker'
import DutyPicker from './dutyPicker'
import RolePicker from './rolePicker'
import VariablePicker from './variablePicker'
import GroupPicker from './groupPicker'
import MatrixPicker from './matrixPicker'
import CrossUnitUserPicker from './CrossUnitUserPicker'
import CrossUnitGroupPicker from './CrossUnitGroupPicker'
import UserVariablePicker from './UserVariablePicker'
import _ from 'lodash'
const { Option } = Select

@inject('userPickStore')
@observer
class UserPickerTable extends Component {
  get appId() {
    const { authorizedApps } = runtimeStore.getState()
    const ITSM = authorizedApps.find((item) => item.name === 'ITSM') || {}
    return ITSM.productId
  }

  renderTag = (record) => {
    // 展示矩阵列
    const matrixInfoVOS = _.map(record.matrixInfoVOS, (vos) => vos.colName).join(',')
    const name = matrixInfoVOS ? `${record.name} | ${matrixInfoVOS}` : record.name
    return <Option title={<Tooltip title={name}>{name}</Tooltip>}>{name}</Option>
  }

  render() {
    const { value, onChange, onChangeUseVariable, useVariable, selectionType } = this.props
    return (
      <StoreConsumer>
        {({ props }) => {
          const { extendQuery, method, showTypes } = props
          const customShowTypes = []
          if (_.includes(showTypes, 'users')) {
            customShowTypes.push('users')
          }
          if (_.includes(showTypes, 'departs')) {
            customShowTypes.push('departs')
          }
          if (_.includes(showTypes, 'roles')) {
            customShowTypes.push('roles')
          }
          return (
            <UserPickerPanel
              globalGroups
              appId={this.appId}
              dataMode="large"
              isolation={false}
              value={value}
              onChange={onChange}
              selectionType={selectionType}
              showTypes={customShowTypes}
              pagination={false}
              getCombineData={async (params) =>
                await searchUsers(params, this.props.userPickStore, extendQuery, method, showTypes)
              }
              getUsers={async (params) =>
                await getUsers(params, this.props.userPickStore, extendQuery, method)
              }
              getDeparts={async (params) =>
                await getDeparts(params, this.props.userPickStore, extendQuery)
              }
              getDepartList={async (params) =>
                await getDepartList(params, this.props.userPickStore, extendQuery)
              }
            >
              {showTypes.map((tab) => {
                const dilver = {
                  value,
                  onChange,
                  key: tab,
                  rowKey: 'id',
                  selectionType,
                  extendQuery,
                  renderTag: this.renderTag
                }
                switch (tab) {
                  case 'groups':
                    return (
                      <GroupPicker
                        {...dilver}
                        method={method}
                        rowKey="groupId"
                        type="groups"
                        tab={i18n('user_group', '用户组')}
                      />
                    )
                  case 'departs_custom':
                    return (
                      <DepartsPicker
                        {...dilver}
                        type="departs"
                        tab={i18n('filed.department', '部门')}
                      />
                    )
                  case 'roles_custom':
                    return (
                      <RolePicker {...dilver} type="roles" tab={i18n('ticket-user-role', '角色')} />
                    )
                  case 'duty_custom':
                    return (
                      <DutyPicker {...dilver} type="dutys" tab={i18n('ticket-user-rota', '值班')} />
                    )
                  case 'variable_custom':
                    return (
                      <VariablePicker
                        {...dilver}
                        type="variables"
                        useVariable={useVariable}
                        onChangeUseVariable={onChangeUseVariable}
                        tab={i18n('ticket-user-variable', '变量')}
                      />
                    )
                  case 'matri_custom':
                    return (
                      <MatrixPicker
                        {...dilver}
                        type="matrix"
                        tab={i18n('ticket-user-matrix', '矩阵')}
                      />
                    )
                  case 'users_cross_tenant':
                    return (
                      <CrossUnitUserPicker
                        {...dilver}
                        type="crossUnitUsers"
                        tab={i18n('user', '用户')}
                      />
                    )
                  case 8:
                    return (
                      <CrossUnitGroupPicker
                        {...dilver}
                        type="crossUnitGroups"
                        tab={i18n('user_group', '用户组')}
                      />
                    )
                  case 'user_variable':
                    return <UserVariablePicker {...dilver} type="userVariable" tab={'人员变量'} />
                }
              })}
            </UserPickerPanel>
          )
        }}
      </StoreConsumer>
    )
  }
}

export default UserPickerTable
