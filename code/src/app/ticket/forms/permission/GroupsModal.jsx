import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Modal, Checkbox, Tooltip, Title, Spin, Input } from '@uyun/components'
import { fortmatGroup, getUserAndRoleList, getGroupId } from './logic'

import styles from './index.module.less'

@inject('permissionListStore')
@observer
class GroupsModal extends Component {
  static defaultProps = {
    visible: false,
    fieldCode: '',
    serviceCode: '',
    serviceRange: [],
    onClose: () => {}
  }

  state = {
    checkedGroups: [],
    kw: undefined
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.visible && this.props.visible) {
      this.queryGroups(this.state.kw)
      this.initialSelectedGroupIds()
    }
  }

  queryGroups = (kw) => {
    const { serviceRange, permissionListStore } = this.props
    // 获取服务范围下的所有用户组
    permissionListStore.getAllGroupsInServiceRange(serviceRange, kw)
    // permissionListStore.getInGroups()
  }

  initialSelectedGroupIds = () => {
    const { panels } = this.props.store

    this.setState({ checkedGroups: panels })
  }

  handleSearch = () => {
    this.queryGroups(this.state.kw)
  }

  handleCheck = (ids) => {
    const { allGroupsInServiceRange } = this.props.permissionListStore
    const { checkedGroups } = this.state

    // 从上一次勾选的用户组和本次筛选得到的用户组中，拿到这次勾选的用户组
    // 并去重
    const groups = checkedGroups
      .filter((item) => ids.includes(getGroupId(item)))
      .concat(allGroupsInServiceRange.filter((item) => ids.includes(getGroupId(item))))
      .reduce((arr, item) => {
        if (arr.every((a) => getGroupId(a) !== getGroupId(item))) {
          arr.push(item)
        }
        return arr
      }, [])

    this.setState({ checkedGroups: groups })
  }

  handleClose = () => {
    this.setState({ checkedGroups: [] })
    this.props.onClose()
  }

  handleOk = async () => {
    const { permissionListStore, store } = this.props
    const { checkedGroups } = this.state
    // 已存在的申请编辑和删除的用户组
    const existedGroupIds = store.panels
      .filter((item) => item.type === 1 || item.type === 2)
      .map(getGroupId)

    // 获取新加的 和 需要撤销的 用户组id
    const addGroups = checkedGroups.filter((item) => !existedGroupIds.includes(getGroupId(item)))
    const deleteGroupIds = existedGroupIds.filter((item) =>
      checkedGroups.every((a) => getGroupId(a) !== item)
    )

    if (addGroups.length > 0) {
      let groups = addGroups.map((group) => fortmatGroup(group, { type: 1 }))
      groups = await getUserAndRoleList(groups)
      store.addEditGroups(groups)
    }
    if (deleteGroupIds.length > 0) {
      // 相当于撤销
      const newPanels = store.panels.filter((item) => !deleteGroupIds.includes(getGroupId(item)))
      this.props.store.setProps({ panels: newPanels })
    }

    this.handleClose()
  }

  // 按照app/group的层级展现
  // 这个弹框只在点击编辑用户组时才出现，所以显示所有用户组
  getGroupsInApps = () => {
    const { serviceRange } = this.props
    const { allGroupsInServiceRange } = this.props.permissionListStore

    const groups = allGroupsInServiceRange.slice()

    // 转换成app/group层级
    const result = serviceRange.map((item) => {
      const appGroups = groups.filter((group) => group.appId === item.appId)

      return {
        ...item,
        groups: appGroups
      }
    })

    return result
  }

  getTitle = () => {
    switch (this.props.serviceCode) {
      case '0':
        return i18n('please.select.group.join', '请选择需加入的用户组')
      case '1':
        return i18n('please.select.group.quit', '请选择需退出的用户组')
      case '3':
        return i18n('please.select.group.edit', '请选择需编辑的用户组')
      default:
        return ''
    }
  }

  render() {
    const { visible } = this.props
    const { checkedGroups, kw } = this.state
    const { getAllGroupsLoading, getInGroupsLoading } = this.props.permissionListStore
    const spinning = getAllGroupsLoading || getInGroupsLoading
    const checkedGroupIds = checkedGroups.map(getGroupId)

    return (
      <Modal
        visible={visible}
        title={this.getTitle()}
        width={800}
        onOk={this.handleOk}
        onCancel={this.handleClose}
      >
        <Input.Search
          style={{ width: 278, marginBottom: 14 }}
          placeholder={i18n('join-group-search-placeholder', '请输入用户组关键字')}
          allowClear
          enterButton
          value={kw}
          onChange={(e) => this.setState({ kw: e.target.value })}
          onSearch={(value) => {
            this.setState({ kw: value }, () => {
              this.handleSearch()
            })
          }}
          onClear={() => {
            this.setState({ kw: undefined }, () => {
              this.handleSearch()
            })
          }}
        />

        <Spin spinning={spinning}>
          <Checkbox.Group
            className="permission-checkbox"
            style={{ width: '100%' }}
            value={checkedGroupIds}
            onChange={this.handleCheck}
          >
            {this.getGroupsInApps().map((app) => (
              <div key={app.appId}>
                <Title>{app.enName + ' - ' + app.appName}</Title>
                <div className={styles.groups}>
                  {app.groups.map((group) => {
                    const groupId = getGroupId(group)
                    return (
                      <Checkbox key={groupId} value={groupId}>
                        <Tooltip title={group.name}>
                          <span className={styles.checkboxLabel}>{group.name}</span>
                        </Tooltip>
                      </Checkbox>
                    )
                  })}
                </div>
              </div>
            ))}
          </Checkbox.Group>
        </Spin>
      </Modal>
    )
  }
}

export default GroupsModal
