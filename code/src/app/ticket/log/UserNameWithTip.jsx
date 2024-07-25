import React, { Component } from 'react'
import { Tooltip, Tag } from '@uyun/components'
import styles from './index.module.less'

/**
 * 用户名称，鼠标hover显示tip
 * tip包含手机号、email、部门
 * 部门数据走接口
 */
export default class UserNameWithTip extends Component {
  static defaultProps = {
    user: {
      userId: '',
      userName: '',
      mobilePhone: '',
      email: ''
      // department: ''
    }
  }

  state = {
    departments: []
  }

  queryDepartments = (userId) => {
    if (!userId) return

    axios
      .get(API.queryDepartsByUserId, { params: { uid: userId } })
      .then((res) => this.setState({ departments: res || [] }))
  }

  handleVisibleChange = (visible) => {
    if (this.props?.crossRemoteTicket === '1') {
      return
    }
    if (visible && this.state.departments.length === 0) {
      this.queryDepartments(this.props.user.userId)
    }
  }

  renderTip = (user) => {
    const { mobilePhone, email, account } = user
    const { source } = this.props
    let isCustomer = ''
    if (source === 'basic' || source === 'record') {
      isCustomer = user.isCustomer === 1 ? '客户人员' : null
    }
    const { departments } = this.state
    const departmentNames = departments.map((item) => item.departPath).join(',')

    return (
      <div>
        <div>
          <i className="iconfont icon-user2 iClass" />
          {user.userName}
          {isCustomer ? '|' + isCustomer : null}
        </div>
        <div>
          <i className="iconfont icon-idcard iClass" />
          {this.props?.crossRemoteTicket === '1' ? null : account}
        </div>
        <div style={{ display: 'flex' }}>
          <i className="iconfont icon-liuchengtu iClass" />
          {this.props?.crossRemoteTicket === '1' ? null : departmentNames}
        </div>
        <div>
          <i className="iconfont icon-phone iClass" />
          {this.props?.crossRemoteTicket === '1' ? null : mobilePhone}
        </div>
        <div>
          <i className="iconfont icon-mail iClass" />
          {this.props?.crossRemoteTicket === '1' ? null : email}
        </div>
      </div>
    )
  }

  render() {
    const { user, source, record, index } = this.props
    return (
      <Tooltip title={this.renderTip(user)} onVisibleChange={this.handleVisibleChange}>
        {source === 'record' && record && (!!record?.toGroup || index > 0) ? ', ' : ''}
        {user.userName ? (
          source === 'record' ? (
            user.userName
          ) : (
            <Tag className={styles.userTag}>{user.userName}</Tag>
          )
        ) : null}
      </Tooltip>
    )
  }
}
