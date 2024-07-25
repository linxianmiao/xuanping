/**
 * 流程图处理人列表组件
 * @param {array} users  处理人
 *
 * @author 顾少华<gush@uyunsoft.cn>
 */

import React, { Component } from 'react'
import { Popover } from '@uyun/components'

class ExucuterList extends Component {
  constructor (props) {
    super(props)
    const users = props.users
    const executionGroup = props.executionGroup
    this.state = {
      isOpen: false,
      hasMany: !_.isEmpty(users) && users.length > 1,
      users: users || [],
      executionGroup: executionGroup || []
    }
  }

  componentWillReceiveProps (nextProps) {
    const { users, executionGroup } = nextProps
    this.setState({
      users: users || [],
      hasMany: !_.isEmpty(users) && users.length > 1,
      executionGroup: executionGroup || []
    })
  }

    changeState = () => {
      this.setState({ isOpen: !this.state.isOpen })
    }

    render () {
      const { isOpen, hasMany } = this.state
      const users = isOpen ? this.state.users : this.state.users.slice(0, 1)
      const executionGroup = isOpen ? this.state.executionGroup : this.state.executionGroup.slice(0, 1)
      return (
        <div>
          { users.length > 0 && <span>{i18n('ticket.list.excutors', '处理人') + ': '}</span> }
          { users.length > 0 ? _.map(users, (item, i) => {
            const pop = (<div key={i}>
              <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{item ? item.userName : ''}</p>
              <p>{item && item.userEmail ? i18n('user_mail', '邮箱') + ': ' + item.userEmail : ''}</p>
              <p>{item && item.mobile ? i18n('mobile', '手机') + ': ' + item.mobile : ''}</p>
            </div>)
            return (
              <Popover key={i} overlayClassName="node-desc-pro" content={pop} trigger="hover" placement="top">
                <span>{ hasMany && !isOpen ? item.userName + '...' : item.userName + ' ' }</span>
              </Popover>
            )
          })
            : null
          }
          { executionGroup.length > 0 && <span>{i18n('ticket.list.screen.executGroup', '处理组')}: </span> }
          { executionGroup.length > 0 ? _.map(executionGroup, item => {
            return (
              <span>{ item.name }</span>
            )
          })
            : null
          }
          { hasMany && <i className={isOpen ? 'iconfont icon-shangtui' : 'iconfont icon-xiatui'} style={{ fontSize: '12px', color: '#5994d6' }} onClick={this.changeState} /> }
        </div>
      )
    }
}

export default ExucuterList
