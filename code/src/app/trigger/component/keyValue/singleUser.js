import React, { Component } from 'react'
import { toJS } from 'mobx'
import { Menu, Dropdown, Tag } from '@uyun/components'
import SingleUserTypes from '../../config/singleUserTypes'
import Users from '../../../ticket/users/index'
import TicketUserStore from '../../../ticket/stores/ticketUserStore'

const SubMenu = Menu.SubMenu

class SingleUser extends Component {
  constructor(props) {
    super(props)
    this.ticketUserStore = new TicketUserStore()
    const defaultUserValue = []
    const singleUserTypes = JSON.parse(JSON.stringify(SingleUserTypes))
    props.value &&
      props.value.map((it) => {
        let flag = true
        singleUserTypes.map((ut) => {
          if (ut.value === it) {
            ut.isSelect = true
            flag = false
          }
          ut.sub &&
            ut.sub.map((s) => {
              if (s.value === it) {
                s.isSelect = true
                flag = false
              }
            })
        })
        if (Array.isArray(this.props.fieldUsers)) {
          this.props.fieldUsers.forEach((fieldUser) => {
            if (it === fieldUser.code) {
              fieldUser.isSelect = true
            }
          })
        }
        if (Array.isArray(this.props.variableUsers)) {
          this.props.variableUsers.forEach((variableUser) => {
            if (it === variableUser.id) {
              variableUser.isSelect = true
            }
          })
        }
      })
    this.state = {
      visible: false,
      dropVisble: false,
      defaultUserValue: [],
      singleUserTypes,
      fieldUsers: _.cloneDeep(toJS(this.props.fieldUsers)) || [],
      variableUsers: _.cloneDeep(toJS(this.props.variableUsers)) || []
    }
  }

  async componentDidMount() {
    if (this.props.value) {
      const res = await this.props.store.getUserList(this.props.value)
      this.setState({
        defaultUserValue: _.map(res, (item) => ({ id: item.userId, name: item.userName }))
      })
    }
  }

  menuClick = (e) => {
    if (e.key === 'line1' || e.key === 'line2' || e.key === 'line3') {
      return false
    }
    if (e.key === 'ADDUSER') {
      this.setState({
        visible: true,
        dropVisble: false
      })
      this.ticketUserStore.getList({ type: '1', kw: '', pageNo: 1, pageSize: 15, orderType: 0 })
    } else {
      const { singleUserTypes, fieldUsers, variableUsers } = this.state
      singleUserTypes.map((action) => {
        if (action.value === e.key) {
          action.isSelect = !action.isSelect
        }
        action.sub &&
          action.sub.map((s) => {
            if (s.value === e.key) {
              s.isSelect = !s.isSelect
            } else {
              if (e.key.substr(9, 6) === s.value.substr(9, 6)) {
                s.isSelect = false
              }
            }
          })
      })
      // 用户类型字段
      !_.isEmpty(fieldUsers) &&
        fieldUsers.map((item) => {
          if (item.code === e.key) {
            item.isSelect = !item.isSelect
          }
        })
      // 变量类型字段
      !_.isEmpty(variableUsers) &&
        variableUsers.map((item) => {
          if (item.id === e.key) {
            item.isSelect = !item.isSelect
          }
        })
      this.setState({
        singleUserTypes,
        fieldUsers,
        variableUsers
      })
    }
  }

  manageData = (value) => {
    const arr = []
    const { singleUserTypes, fieldUsers, defaultUserValue, variableUsers } = this.state
    fieldUsers.map((fieldUser) => {
      if (fieldUser.isSelect) arr.push(fieldUser.code)
    })
    variableUsers.map((variableUser) => {
      if (variableUser.isSelect) arr.push(variableUser.id)
    })
    singleUserTypes.map((action) => {
      if (action.isSelect) {
        arr.push(action.value)
      }
      action.sub &&
        action.sub.map((s) => {
          if (s.isSelect) {
            arr.push(s.value)
          }
        })
    })
    const userValue = value || defaultUserValue
    userValue.map((v) => {
      arr.push(v.id)
    })
    return arr
  }

  handleOk = (value) => {
    const val = _.cloneDeep(value[1])
    this.setState({
      visible: false,
      defaultUserValue: val
    })
    const arr = this.manageData(val)
    this.props.onChangeCondition && this.props.onChangeCondition(arr)
  }

  handleCancel = (e) => {
    this.setState({
      visible: false
    })
  }

  tagClose = (index, type = 'type', value) => {
    const { singleUserTypes, fieldUsers, defaultUserValue, variableUsers } = this.state
    if (type === 'type') {
      singleUserTypes[index].isSelect = false
    } else if (type === 'sub') {
      singleUserTypes.map((st) => {
        if (st.value === value) {
          st.sub[index].isSelect = false
        }
      })
    } else if (type === 'fieldUsers') {
      fieldUsers[index].isSelect = false
    } else if (type === 'variableUsers') {
      variableUsers[index].isSelect = false
    } else {
      defaultUserValue.splice(index, 1)
    }
    this.setState({ singleUserTypes, fieldUsers, defaultUserValue, variableUsers })
    const arr = this.manageData()
    this.props.onChangeCondition && this.props.onChangeCondition(arr)
  }

  handleVisibleChange = (flag) => {
    if (!flag) {
      const arr = this.manageData()
      this.props.onChangeCondition && this.props.onChangeCondition(arr)
    }
    this.setState({ dropVisble: flag })
  }

  handleSearch = (data) => {
    this.ticketUserStore.getList(_.assign({}, data))
  }

  render() {
    const { label, triggerNode } = this.props
    const { visible, dropVisble, singleUserTypes, fieldUsers, defaultUserValue, variableUsers } =
      this.state
    let popupContainer = document.getElementById('notification-wrap')
    if (triggerNode) {
      popupContainer = document.getElementById(triggerNode)
    }
    const menu = (
      <Menu onClick={this.menuClick}>
        <Menu.Item key="line1" className="line1">
          {i18n('system_attr', '系统属性')}
        </Menu.Item>
        {singleUserTypes.map((action) => {
          if (action.value === '${ticket.creator}') {
            return (
              <Menu.Item key={action.value} className={action.isSelect ? 'ul-menu-item' : ''}>
                <div className="user-list-menu-item">
                  {action.name}
                  {action.isSelect && <i className="iconfont icon-dui" />}
                </div>
              </Menu.Item>
            )
          } else {
            return (
              <SubMenu key={action.value} title={action.name}>
                {action.sub.map((s) => {
                  return (
                    <Menu.Item key={s.value} className={s.isSelect ? 'ul-menu-item' : ''}>
                      <div className="user-list-menu-item">
                        {s.name}
                        {s.isSelect && <i className="iconfont icon-dui" />}
                      </div>
                    </Menu.Item>
                  )
                })}
              </SubMenu>
            )
          }
        })}
        <Menu.Item key="line2" className="line2">
          {i18n('user_Fields', '用户类型字段')}
        </Menu.Item>

        {!_.isEmpty(fieldUsers) &&
          _.map(fieldUsers, (fieldUser) => {
            return (
              <Menu.Item key={fieldUser.code} className={fieldUser.isSelect ? 'ul-menu-item' : ''}>
                <div className="user-list-menu-item">
                  {fieldUser.fieldName}
                  {fieldUser.isSelect && <i className="iconfont icon-dui" />}
                </div>
              </Menu.Item>
            )
          })}
        <Menu.Item key="line3" className="line2">
          {i18n('variable_Fields', '变量类型字段')}
        </Menu.Item>

        {!_.isEmpty(variableUsers) &&
          _.map(variableUsers, (variableUser) => {
            return (
              <Menu.Item
                key={variableUser.id}
                className={variableUser.isSelect ? 'ul-menu-item' : ''}
              >
                <div className="user-list-menu-item">
                  {variableUser.name}
                  {variableUser.isSelect && <i className="iconfont icon-dui" />}
                </div>
              </Menu.Item>
            )
          })}
        <Menu.Divider />
        <Menu.Item key="ADDUSER">{i18n('custom_user', '自定义人员')}</Menu.Item>
      </Menu>
    )
    return (
      <div className="userSelect">
        <Dropdown
          overlay={menu}
          trigger={['click']}
          visible={dropVisble}
          onVisibleChange={this.handleVisibleChange}
          getPopupContainer={() => popupContainer}
        >
          <div className="user-list default-height">
            {singleUserTypes &&
              singleUserTypes.map((item, index) => {
                if (item.isSelect) {
                  return (
                    <Tag
                      key={item.value}
                      closable
                      onClose={() => {
                        this.tagClose(index)
                      }}
                    >
                      {item.name}
                    </Tag>
                  )
                }
                return (
                  item.sub &&
                  item.sub.map((s, idx) => {
                    if (s.isSelect) {
                      return (
                        <Tag
                          key={s.value}
                          closable
                          onClose={() => {
                            this.tagClose(idx, 'sub', item.value)
                          }}
                        >
                          {s.name}
                        </Tag>
                      )
                    }
                  })
                )
              })}
            {fieldUsers &&
              fieldUsers.map((item, index) => {
                if (item.isSelect) {
                  return (
                    <Tag
                      key={item.code}
                      closable
                      onClose={() => {
                        this.tagClose(index, 'fieldUsers')
                      }}
                    >
                      {item.fieldName}
                    </Tag>
                  )
                }
              })}
            {variableUsers &&
              variableUsers.map((item, index) => {
                if (item.isSelect) {
                  return (
                    <Tag
                      key={item.id}
                      closable
                      onClose={() => {
                        this.tagClose(index, 'variableUsers')
                      }}
                    >
                      {item.name}
                    </Tag>
                  )
                }
              })}
            {defaultUserValue &&
              defaultUserValue.map((item, index) => {
                return (
                  <Tag
                    key={item.id}
                    closable
                    onClose={() => {
                      this.tagClose(index, 'user')
                    }}
                  >
                    {item.name}
                  </Tag>
                )
              })}
          </div>
        </Dropdown>
        <Users
          TicketUserStore={this.ticketUserStore}
          visible={visible}
          handleOk={this.handleOk}
          handleCancel={this.handleCancel}
          handleSearch={this.handleSearch}
          defaultTab={'1'}
          selects={{
            1: defaultUserValue
          }}
          tabs={['1']}
        />
        {/* <Modal
                visible={visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={620}
                footer={''}
                className='mymodelstyle'
        >
                <UserSystem
                    onCancel={this.handleCancel}
                    onOk={this.handleOk}
                    title={label}
                    selectedData={[]}
                    status={{status1: 1, status2: 1, status3: 0}}
                    opt={0}
        />
            </Modal> */}
      </div>
    )
  }
}

export default SingleUser
