import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import UserSelect from './userSelect'
import DepartmentSelect from './departmentSelect'
import RoleSelect from './roleSelect'
import VariableSelect from './variableSelect'
import PropTypes from 'prop-types'
import { Tabs } from '@uyun/components'
import { TABS, SELECTTYPE } from './config'
import './styles/userSelect.less'
const TabPane = Tabs.TabPane

/**
 * 1 - user - 人员
 * 0- group - 用户组
 * 2-department - 部门
 * 3-role - 角色
 * 4-rota - 值班
 * 5-variable - 变量
 */

@observer
class TabSelect extends Component {
    createTabPane = tab => {
      const { userList, groupList, departmentList, roleList, rotaList, variableList,
        selectUsers, selectGroups, selectDepartments, selectRoles, selectRotas, selectVariables, isLoads,
        query, isUseVariable, groupSelectUserList, departSelectUsertList } = toJS(this.props.TicketUserStore)
      const dilver = {
        tab,
        isLoad: isLoads[tab],
        query,
        selectsType: this.props.selectsType || SELECTTYPE,
        setSelects: this.setSelects,
        onSearch: this.onSearch,
        setUseVariable: this.setUseVariable,
        isShowUserVariable: this.props.isShowUserVariable
      }

      switch (tab) {
        case '1' : return <UserSelect lists={userList} selects={selectUsers} {...dilver} groupSelectUserList={groupSelectUserList} departSelectUsertList={departSelectUsertList} />
        case '0' : return <UserSelect lists={groupList} selects={selectGroups} {...dilver} />
        case '2' : return <DepartmentSelect lists={departmentList} selects={selectDepartments} {...dilver} />
        case '3' : return <RoleSelect lists={roleList} selects={selectRoles} {...dilver} />
        case '4' : return <RoleSelect lists={rotaList} selects={selectRotas} {...dilver} />
        case '5' : return <VariableSelect isUseVariable={isUseVariable} lists={variableList} selects={selectVariables} {...dilver} />
      }
    }

    setSelects = (tab, selects) => {
      if (this.props.selectsType && this.props.selectsType['1'] === 'radio' && this.props.selectsType['0'] === 'radio') {
        if (tab === '1') {
          this.props.TicketUserStore.setSelects(tab, selects)
          this.props.TicketUserStore.setSelects('0', [])
        } else {
          this.props.TicketUserStore.setSelects(tab, selects)
          this.props.TicketUserStore.setSelects('1', [])
        }
      } else {
        this.props.TicketUserStore.setSelects(tab, selects)
      }
    }

    onSearch = (tab, query, type) => {
      this.props.TicketUserStore.setQuery(tab, query, type)
      this.timer = setTimeout(() => {
        this.props.handleSearch(query)
      }, 300)
    }

    setUseVariable = checked => {
      this.props.TicketUserStore.setUseVariable(checked)
    }

    render () {
      const { tabs, tab } = this.props
      return (
        <Tabs activeKey={tab} onChange={tab => { this.props.onChangeTabs(tab) }}>
          {_.map(tabs, tab => {
            return <TabPane tab={TABS[tab].name} key={tab}>{this.createTabPane(tab)}</TabPane>
          })}
        </Tabs>
      )
    }
}
TabSelect.propTypes = {
  tabs: PropTypes.array.isRequired,
  onChangeTabs: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  selectsType: PropTypes.object,
  isShowUserVariable: PropTypes.bool
}
export default TabSelect
