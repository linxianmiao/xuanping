import React, { Component } from 'react'
import UserPicker from '@uyun/ec-user-picker'
import { Tag } from '@uyun/components'
import { StoreConsumer, getUsers, getGroups, ObjectToArray, getDeparts, getDepartList } from './config'
import { inject, observer } from 'mobx-react'
import UserPickerExtendButton from './userPickerExtendButton'
import classnames from 'classnames'
import styles from './index.module.less'
@inject('userPickStore')
@observer
export default class UserPickSelect extends Component {
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

  render() {
    const { onChange, value, userPickStore } = this.props
    return (
      <StoreConsumer>
        {
          ({ props }) => {
            const { extendQuery, method, disabled, size, tabs, selectionType, popupContainerId, extendFunc, placeholder } = props
            return (
              <div
                ref={this.ref}
                className={classnames({
                  [styles.userPickerWrap]: true,
                  [styles.disabled]: disabled
                })}>
                {
                  disabled
                    ? _.map(ObjectToArray(value), item => <Tag style={{ marginBottom: 8 }} key={item.id}>{item.name}</Tag>)
                    : <UserPicker
                      mode="select"
                      width={this.refWidth < 300 ? 300 : null}
                      placeholder={placeholder || i18n('globe.select', '请选择')}
                      size={size}
                      disabled={disabled}
                      value={value}
                      onChange={onChange}
                      selectionType={selectionType}
                      showUsers={tabs.includes(1)}
                      showGroups={tabs.includes(0)}
                      getUsers={async params => await getUsers(params, userPickStore, extendQuery, method)}
                      getGroups={async params => await getGroups(params, userPickStore, extendQuery, method)}
                      getDeparts={async params => await getDeparts(params, this.props.userPickStore)}
                      getDepartList={async params => await getDepartList(params, this.props.userPickStore)}
                      getPopupContainer={() => popupContainerId ? document.getElementById(popupContainerId) : document.body}
                    />
                }
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
          }
        }
      </StoreConsumer>
    )
  }
}
