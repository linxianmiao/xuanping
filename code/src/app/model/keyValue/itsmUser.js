import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Tag } from '@uyun/components'
import Users from '../../ticket/users'
import TicketUserStore from '../../ticket/stores/ticketUserStore'

@inject('userStore')
@observer
class User extends Component {
  constructor (props) {
    super(props)
    this.ticketUserStore = new TicketUserStore()
    this.state = {
      visible: false, // 用户选择组件的显示隐藏
      list: []
    }
  }

    componentDidMount = async () => {
      const { value, userTab } = this.props
      if (!_.isEmpty(value)) {
        let res = []
        if (userTab === '1') {
          res = await this.props.userStore.getUserList(value)
        } else {
          const { departList } = this.props.userStore
          res = _.filter(departList, item => _.includes(value, item.id))
        }
        this.setState({
          list: res
        })
      }
    }

    // 显示用户组件弹框
    showAddUser = () => {
      const { userTab } = this.props
      this.ticketUserStore.getList({ type: userTab, kw: '', pageNo: 1, pageSize: 15, orderType: 0 })
      this.setState({ visible: true })
    }

    // 用户组件弹窗取消
    handleCancel = () => {
      this.setState({ visible: false })
    }

    // 删除当前选中的用户
    closeUser = (id, e) => {
      e.stopPropagation()
      this.setState({
        list: this.state.list.filter(item => item.id !== id)
      }, () => {
        const ids = _.map(this.state.list, item => item.id)
        this.props.onChangeCondition(ids)
      })
    }

    handleOk = values => {
      this.setState({
        list: values[this.props.userTab],
        visible: false
      }, () => {
        const ids = _.map(this.state.list, item => item.id)
        this.props.onChangeCondition(ids)
      })
    }

    handleSearch = query => {
      this.ticketUserStore.getList(_.assign({}, query))
    }

    render () {
      const { style, userTab } = this.props
      const { visible, list } = this.state
      return (
        <React.Fragment>
          <div
            style={style}
            className="tags-lists"
            onClick={() => this.showAddUser()}
            placeholder={i18n('ticket.create.select_handler', '请选择处理人')}>
            {_.map(list, item => {
              return (
                <Tag key={item.id} closable onClose={e => { this.closeUser(item.id, e) }} >
                  { item.name }
                </Tag>
              )
            })}
          </div>
          <Users
            TicketUserStore={this.ticketUserStore}
            visible={visible}
            handleOk={this.handleOk}
            handleCancel={this.handleCancel}
            handleSearch={this.handleSearch}
            defaultTab={userTab}
            selects={{
              [userTab]: list
            }}
            tabs={[userTab]} />
        </React.Fragment>
      )
    }
}

export default User
