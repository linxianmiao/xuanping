import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Menu, Dropdown, Tag } from '@uyun/components'
import UserSystem from '../../../ticket/users'
import UserTypes from '../../config/userTypes'
import UserStore from '../../../ticket/stores/ticketUserStore'


/**
 * 快捷用户保存在state.userTypes中
 * 用户保存在state.userValue中
 * 用户组保存在props.item.staffs中
 */
@observer
class User extends Component {
  constructor (props) {
    super(props)
    this.TicketUserStore = new UserStore()
    const userTypes = JSON.parse(JSON.stringify(UserTypes))
    this.state = {
      visible: false,
      dropVisble: false,
      userValue: [],
      userTypes
    }
  }

  async componentDidMount() {
    const { userTypes } = this.state

    const values = _.filter(this.props.item.value, id => _.some(userTypes, type => type.value !== id))
    const userValue = await this.props.store.getUserList(values)

    this.setState({
      userValue: _.map(userValue, item => ({ id: item.userId, name: item.userName })),
      userTypes: _.map(userTypes, item => _.includes(this.props.item.value, item.value) ? _.assign({}, item, { isSelect: true }) : item)
    })
  }

    menuClick = e => {
      if (e.key === 'ADDUSER') {
        const num = { type: '1' }
        this.handleSearch(num)
        this.setState({
          visible: true,
          dropVisble: false
        })
      } else {
        const { userTypes } = this.state
        userTypes.map(action => {
          if (action.value === e.key) {
            action.isSelect = !action.isSelect
          }
        })
        this.setState({
          userTypes
        })
      }
    }

    manageData = (value, userTypes) => {
      const arr = []
      userTypes = userTypes || this.state.userTypes
      this.state.userTypes.map(action => {
        if (action.isSelect) {
          arr.push(action.value)
        }
      })
      value.map(v => {
        arr.push(v.id)
      })
      return arr
    }

    handleOk = value => {
      const users = value['1']
      const groups = value['0'] ? value['0'].map(item => ({ ...item, type: 'group' })) : []
      this.setState({
        visible: false,
        userValue: users
      })
      const arr = this.manageData(users)
      this.setTriggerData(this.props.triggerIndex, this.props.paramIndex, arr)
      this.setTriggerData(this.props.triggerIndex, this.props.paramIndex, groups, 'staff')
    }

    handleCancel = e => {
      this.setState({
        visible: false
      })
    }

    setTriggerData = (triggerIndex, paramIndex, value, flag) => {
      this.props.setTriggerData(triggerIndex, paramIndex, value, flag)
    }

    tagClose = (index, type = 'type') => {
      const { item: { staffs } } = this.props
      const { userTypes, userValue } = this.state
      const nextStaffs = staffs ? staffs.slice() : []
      if (type === 'type') {
        userTypes[index].isSelect = false
      } else if (type === 'user') {
        userValue.splice(index, 1)
      } else if (type === 'group') {
        nextStaffs.splice(index, 1)
        this.setTriggerData(this.props.triggerIndex, this.props.paramIndex, nextStaffs, 'staff')
      }
      const arr = this.manageData(userValue, userTypes)
      this.setTriggerData(this.props.triggerIndex, this.props.paramIndex, arr)
    }

    handleVisibleChange = flag => {
      if (!flag) {
        const arr = this.manageData(this.state.userValue)
        this.setTriggerData(this.props.triggerIndex, this.props.paramIndex, arr)
      }
      this.setState({ dropVisble: flag })
    }

    handleSearch = query => {
      this.TicketUserStore.getList(query)
    }

    // componentDidMount = () => {
    //     const num = {type: '1'}
    //     this.handleSearch(num)
    // }
    // showModal = () => {
    //     const num = {type: '1'}
    //     this.handleSearch(num)
    // }

    getValue = () => {
      const { staffs = [] } = this.props.item
      const { userValue } = this.state
      const value = { 1: [], 0: []}

      userValue.forEach(item => {
        value['1'].push(_.omit(item, 'type'))
      })
      staffs && staffs.forEach(item => {
        value['0'].push(_.omit(item, 'type'))
      })

      return value
    }

    render () {
      const { triggerNode, trigger = {}, item } = this.props
      const { visible, dropVisble, userTypes, userValue } = this.state
      const { staffs = [] } = item
      // const newValue = { 1: userValue }
      let popupContainer = document.getElementById('notification-wrap')
      if (triggerNode) {
        popupContainer = document.getElementById(triggerNode)
      }
      const menu = (
        <Menu onClick={this.menuClick}>
          {
            userTypes.map(action => {
              return (
                <Menu.Item key={action.value}>
                  <div className="user-list-menu-item">
                    {action.name}
                    {action.isSelect && <i className="iconfont icon-dui" />}
                  </div>
                </Menu.Item>
              )
            })
          }
          <Menu.Divider />
          <Menu.Item key="ADDUSER">{i18n('custom_user', '自定义人员')}</Menu.Item>
        </Menu>
      )

      // 邮件收件人支持用户组
      const tabs = trigger.type === 'sendEmail' ? ['1', '0'] : ['1']

      return (<div className="userSelect">
        <Dropdown
          overlay={menu}
          trigger={['click']}
          visible={dropVisble}
          onVisibleChange={this.handleVisibleChange}
          getPopupContainer={() => popupContainer}
        >
          <div className="user-list">
            {
              userTypes && userTypes.map((item, index) => {
                if (item.isSelect) {
                  return (
                    <Tag
                      key={item.value}
                      closable
                      onClose={() => { this.tagClose(index) }}
                    >{item.name}</Tag>
                  )
                }
              })
            }
            {
              userValue && userValue.map((item, index) => {
                return (
                  <Tag
                    key={item.id}
                    closable
                    onClose={() => { this.tagClose(index, 'user') }}
                  >{item.name}</Tag>
                )
              })
            }
            {
              staffs && staffs.map((item, index) => {
                return (
                  <Tag
                    key={item.id}
                    closable
                    onClose={() => this.tagClose(index, 'group')}
                  >
                    {item.name}
                  </Tag>
                )
              })
            }
          </div>
        </Dropdown>
        <UserSystem
          TicketUserStore={this.TicketUserStore}
          visible={visible}
          handleOk={this.handleOk}
          handleCancel={this.handleCancel}
          handleSearch={this.handleSearch}
          defaultTab={'1'}
          selects={this.getValue()}
          tabs={tabs} />
      </div>)
    }
}

export default User
