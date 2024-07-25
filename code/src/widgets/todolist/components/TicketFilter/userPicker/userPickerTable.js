import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Select, Tooltip } from '@uyun/components'
import { UserPickerTable } from '@uyun/ec-user-picker'
import { StoreConsumer, getUsers, getGroups, getDeparts, getDepartList } from './config'
import DepartsPicker from './departsPicker'
import DutyPicker from './dutyPicker'
import RolePicker from './rolePicker'
import VariablePicker from './variablePicker'
import GroupPicker from './groupPicker'
const { Option } = Select

@inject('userPickStore')
@observer
export default class extends Component {
  renderTag = (record) => (
    <Option
      title={
        <Tooltip title={record.name}>
          {record.name}
        </Tooltip>
      }
    >
      {record.name}
    </Option>
  )

  render() {
    const { value, onChange, onChangeUseVariable, useVariable } = this.props
    return (
      <StoreConsumer>
        {
          ({ props }) => {
            const { extendQuery, method, selectionType, tabs } = props
            return (
              <UserPickerTable
                value={value}
                onChange={onChange}
                selectionType={selectionType}
                showUsers={tabs.includes(1)}
                showGroups={false}
                getUsers={async (params) => await getUsers(params, this.props.userPickStore, extendQuery, method)}
                getGroups={async (params) => await getGroups(params, this.props.userPickStore, extendQuery, method)}
                getDeparts={async (params) => await getDeparts(params, this.props.userPickStore)}
                getDepartList={async (params) => await getDepartList(params, this.props.userPickStore)}
              >
                {
                  tabs.map(tab => {
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
                      case 0: return (
                        <GroupPicker
                          {...dilver}
                          method={method}
                          rowKey="groupId"
                          type="groups"
                          tab={i18n('user_group', '用户组')}
                        />
                      )
                      case 2: return (
                        <DepartsPicker
                          {...dilver}
                          type="departs"
                          tab={i18n('filed.department', '部门')}
                        />
                      )
                      case 3: return (
                        <RolePicker
                          {...dilver}
                          type="roles"
                          tab={i18n('ticket-user-role', '角色')}
                        />
                      )
                      case 4: return (
                        <DutyPicker
                          {...dilver}
                          type="dutys"
                          tab={i18n('ticket-user-rota', '值班')}
                        />
                      )
                      case 5: return (
                        <VariablePicker
                          {...dilver}
                          type="variables"
                          useVariable={useVariable}
                          onChangeUseVariable={onChangeUseVariable}
                          tab={i18n('ticket-user-variable', '变量')}
                        />
                      )
                    }
                  })
                }
              </UserPickerTable>
            )
          }
        }
      </StoreConsumer>

    )
  }
}