import React, { Component } from 'react'
import originUserTypes from '~/trigger/config/userTypes'
import ITSMUser from '~/components/itsmUsers'
import { PlusOutlined } from '@uyun/icons'
import { Menu, Dropdown, Tag } from '@uyun/components'
import '../style/triggerUser.less'
import * as R from 'ramda'

const originUserTypeValues = R.pluck('value', originUserTypes)

const splitArray = (predicate, list) => {
  const first = []
  const second = []
  list.forEach((item) => {
    predicate(item) ? first.push(item) : second.push(item)
  })
  return [first, second]
}

// 把userTypeValues和users统一成相同的属性名，便于展示
const getCombinedList = (originUserTypes, userTypeValues, users) => {
  const updatedUserTypes = originUserTypes
    .map(({ value, name }) => ({
      id: value,
      name
    }))
    .filter(({ id }) => userTypeValues.includes(id))
  return [...updatedUserTypes, ...users]
}

export default class TriggerUser extends Component {
  constructor(props) {
    super(props)
    // 把传进来的数据分成两个数组分别处理
    const [userTypeValues, userIds] = splitArray(
      (item) => originUserTypeValues.includes(item),
      props.value
    )
    this.state = {
      visible: false,
      userIds,
      userTypeValues,
      users: []
    }
  }

  componentDidMount() {
    this.getUserList(this.state.userIds).then((list) => {
      const users = list.map((item) => ({
        id: item.userId,
        name: item.userName
      }))
      this.setState({ users })
    })
  }

  getUserList = async (ids) => {
    const res = (await axios.post(API.USER_LIST_NO_ORG, { ids: ids.join() })) || []
    return res
  }

  handleUserTypeClick = ({ key }) => {
    const { userTypeValues, userIds } = this.state
    const updatedUserTypeValues = userTypeValues.includes(key)
      ? userTypeValues.filter((type) => type !== key)
      : [...userTypeValues, key]
    this.setState({ userTypeValues: updatedUserTypeValues })
    this.props.onChange([...updatedUserTypeValues, ...userIds])
  }

  handleUserChange = (users) => {
    const { userTypeValues } = this.state
    const userIds = R.pluck('id', users)
    this.setState({ userIds, users })
    this.props.onChange([...userTypeValues, ...userIds])
  }

  handleClose = (id) => {
    if (originUserTypeValues.includes(id)) {
      const userTypeValues = this.state.userTypeValues.filter((value) => value !== id)
      this.setState({ userTypeValues })
      this.props.onChange([...userTypeValues, ...this.state.userIds])
    } else {
      const userIds = this.state.userIds.filter((userId) => userId !== id)
      const users = this.state.users.filter((user) => user.id !== id)
      this.setState({ userIds, users })
      this.props.onChange([...this.state.userTypeValues, ...userIds])
    }
  }

  handleVisibleChange = (visible) => {
    this.setState({ visible })
  }

  render() {
    const { userTypeValues, userIds, users, visible } = this.state
    const menu = (
      <Menu multiple selectedKeys={userTypeValues} onClick={this.handleUserTypeClick}>
        {originUserTypes.map(({ name, value }) => (
          <Menu.Item key={value}>{name}</Menu.Item>
        ))}
        <Menu.Divider />
        <ITSMUser tabs={['1']} viewType="custom" value={userIds} onChange={this.handleUserChange}>
          <div className="trigger-user-custom" onClick={() => this.handleVisibleChange(false)}>
            <PlusOutlined /> {i18n('customer_user', '自定义人员')}
          </div>
        </ITSMUser>
      </Menu>
    )
    const list = getCombinedList(originUserTypes, userTypeValues, users)
    return (
      <Dropdown overlay={menu} visible={visible} onVisibleChange={this.handleVisibleChange}>
        <div className="trigger-user">
          {list.map(({ id, name }) => (
            <Tag
              key={id}
              onClose={(e) => e.stopPropagation()}
              afterClose={() => this.handleClose(id)}
              closable
            >
              {name}
            </Tag>
          ))}
        </div>
      </Dropdown>
    )
  }
}
