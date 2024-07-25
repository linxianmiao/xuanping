import React, { Component } from 'react'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import { Tag } from '@uyun/components'
import './styles/header.less'
@observer
class Header extends Component {
    handleClose = (type, item, list) => {
      this.props.TicketUserStore.setSelects(type, _.filter(list, data => data.id !== item.id))
    }

    render () {
      const { selectGroups, selectUsers, selectDepartments, selectRoles, selectRotas, selectVariables } = toJS(this.props.TicketUserStore)
      return (
        <div className="ticket-user-modal-header-wrap">
          {_.map(selectUsers, item => {
            return <Tag key={item.id} closable onClose={() => { this.handleClose('1', item, selectUsers) }}>{item.name}</Tag>
          })}
          {_.map(selectGroups, item => {
            return <Tag key={item.id} closable onClose={() => { this.handleClose('0', item, selectGroups) }}>{item.name}</Tag>
          })}
          {_.map(selectDepartments, item => {
            return <Tag key={item.id} closable onClose={() => { this.handleClose('2', item, selectDepartments) }}>{item.name}</Tag>
          })}
          {_.map(selectRoles, item => {
            return <Tag key={item.id} closable onClose={() => { this.handleClose('3', item, selectRoles) }}>{item.name}</Tag>
          })}
          {_.map(selectRotas, item => {
            return <Tag key={item.id} closable onClose={() => { this.handleClose('4', item, selectRotas) }}>{item.name}</Tag>
          })}
          {_.map(selectVariables, item => {
            return <Tag key={item.id} closable onClose={() => { this.handleClose('5', item, selectVariables) }}>{item.name}</Tag>
          })}
        </div>
      )
    }
}

export default Header
