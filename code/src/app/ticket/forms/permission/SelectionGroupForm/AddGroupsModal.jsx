import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { Modal, Checkbox, Tooltip, Title, Spin, Input } from '@uyun/components'
import { getGroupId } from '../logic'

import styles from '../index.module.less'

@inject('permissionListStore')
@observer
class GroupsModal extends Component {
  static defaultProps = {
    serviceCode: '',
    serviceRange: []
  }

  state = {
    visible: false,
    kw: undefined
  }

  get store() {
    return this.props.store
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.visible && this.state.visible) {
      this.queryGroups(this.state.kw)
    }
  }

  queryGroups = (kw) => {
    const { group, serviceRange, permissionListStore } = this.props
    const serviceCode = group.type === 3 ? 0 : 1 // 0:加入 1:退出
    const { relatedUsers } = toJS(group)

    // 弹框打开时，获取服务范围下的所有用户组
    permissionListStore.getGroupsByAppIdAndUserId(serviceRange, kw, serviceCode, relatedUsers)
  }

  handleSearch = () => {
    this.queryGroups(this.state.kw)
  }

  handleCheck = (ids) => {
    const { allGroupsInServiceRange } = this.props.permissionListStore
    const { selectedGroups } = this.store

    // 从上一次勾选的用户组和本次筛选得到的用户组中，拿到这次勾选的用户组
    // 并去重
    const groups = selectedGroups
      .filter((item) => ids.includes(getGroupId(item)))
      .concat(allGroupsInServiceRange.filter((item) => ids.includes(getGroupId(item))))
      .reduce((arr, item) => {
        if (arr.every((a) => getGroupId(a) !== getGroupId(item))) {
          arr.push(item)
        }
        return arr
      }, [])

    this.store.setProps({ selectedGroups: groups })
  }

  handleOpen = (group) => {
    this.setState({ visible: true })
    this.store.setProps({
      currentGroup: group,
      selectedGroups: group.relatedGroups.slice()
    })
  }

  handleClose = () => {
    this.setState({ visible: false })
    this.store.setProps({
      currentGroup: null,
      selectedGroups: []
    })
  }

  handleOk = async () => {
    this.store.currentGroup.relatedGroups = toJS(this.store.selectedGroups)
    this.handleClose()
  }

  // 按照app/group的层级展现
  // 按关键字过滤
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
    const { group } = this.props

    switch (group.type) {
      case 3:
        return i18n('please.select.group.join', '请选择需加入的用户组')
      case 4:
        return i18n('please.select.group.quit', '请选择需退出的用户组')
      case 1:
        return i18n('please.select.group.edit', '请选择需编辑的用户组')
      default:
        return ''
    }
  }

  render() {
    const { visible, kw } = this.state
    const { group } = this.props
    const { getAllGroupsLoading, getInGroupsLoading } = this.props.permissionListStore
    const { selectedGroups } = this.store
    const selectedGroupIds = selectedGroups.map(getGroupId)

    const spinning = getAllGroupsLoading || getInGroupsLoading

    return (
      <>
        {React.Children.map(this.props.children, (child) =>
          React.cloneElement(child, {
            onClick: () => this.handleOpen(group)
          })
        )}
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
              value={selectedGroupIds}
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
      </>
    )
  }
}

export default GroupsModal
