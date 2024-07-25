import React, { Component } from 'react'
import UserPicker from '@uyun/ec-user-picker'
import { Tag, Select, Tooltip } from '@uyun/components'
import { StoreConsumer, getUsers, getGroups, getDeparts, getDepartList } from './config'
import { inject, observer } from 'mobx-react'
import UserPickerExtendButton from './userPickerExtendButton'
import classnames from 'classnames'
import GroupPicker from './groupPicker'
import styles from './index.module.less'
const { Option } = Select
@inject('userPickStore')
@observer
class UserPickSelect extends Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
  }

  // 获取组件得宽，如果过小得话，设置一个300得宽，不在让drop于select一样宽
  get refWidth() {
    if (this.ref.current) {
      return this.ref.current.offsetWidth
    }
    return null
  }

  renderTag = (record) => {
    // 展示矩阵列
    const matrixInfoVOS = _.map(record.matrixInfoVOS, (vos) => vos.colName).join(',')
    const name = matrixInfoVOS ? `${record.name} | ${matrixInfoVOS}` : record.name
    return <Option title={<Tooltip title={name}>{name}</Tooltip>}>{name}</Option>
  }

  render() {
    const { onChange, value, userPickStore, isRequired } = this.props

    return (
      <StoreConsumer>
        {({ props }) => {
          const {
            extendQuery,
            method,
            disabled,
            size,
            tabs,
            selectionType,
            popupContainerId,
            extendFunc,
            placeholder,
            showTypes,
            id
          } = props
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
            <div
              ref={this.ref}
              id={id}
              className={classnames({
                [styles.userPickerWrap]: true,
                [styles.disabled]: disabled
              })}
            >
              {disabled ? (
                value.all && value.all.length > 0 ? (
                  _.map(value.all, (item) => (
                    <Tag style={{ marginBottom: 8 }} key={item.id}>
                      {item.name || item.realname}
                    </Tag>
                  ))
                ) : (
                  '--'
                )
              ) : (
                <UserPicker
                  mode="select"
                  showTypes={customShowTypes}
                  width={this.refWidth < 300 ? 300 : null}
                  placeholder={
                    isRequired === 2 ? '' : placeholder || i18n('globe.select', '请选择')
                  }
                  size={size}
                  disabled={isRequired === 2}
                  value={value}
                  onChange={onChange}
                  selectionType={this.props.selectionType}
                  showDeparts={tabs.includes(2)}
                  getUsers={async (params) =>
                    await getUsers(params, userPickStore, extendQuery, method)
                  }
                  getGroups={async (params) =>
                    await getGroups(params, userPickStore, extendQuery, method)
                  }
                  getDeparts={async (params) => await getDeparts(params, this.props.userPickStore)}
                  getDepartList={async (params) =>
                    await getDepartList(params, this.props.userPickStore)
                  }
                  getPopupContainer={() => (id ? document.getElementById(id) : document.body)}
                >
                  {showTypes.map((tab) => {
                    const dilver = {
                      value,
                      onChange,
                      key: tab,
                      rowKey: 'id',
                      selectionType,
                      extendQuery,
                      renderTag: this.renderTag,
                      mode: 'select'
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
                    }
                  })}
                </UserPicker>
              )}
              <UserPickerExtendButton
                extendFunc={extendFunc}
                disabled={disabled}
                size={size}
                tabs={tabs}
                onChange={onChange}
                value={value}
              />
            </div>
          )
        }}
      </StoreConsumer>
    )
  }
}
export default UserPickSelect
