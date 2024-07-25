import React, { Component } from 'react'
import { toJS } from 'mobx'
import { LeftOutlined } from '@uyun/icons';
import { Modal, Icon } from '@uyun/components'
import GroupList from './GroupList'
import SelectedGroupList from './SelectedGroupList'
import { getGroupId, fortmatGroup, getUserAndRoleList } from '../logic'
import styles from './index.module.less'

export default class GroupSelectModal extends Component {
  state = {
    page: 1, // 1:用户组列表 3:选中列表
    checkedGroups: toJS(this.props.store.panels).filter(item => item.type === 1) // 选中的用户组
  }

  componentDidUpdate(prevProps) {
    if (this.props.visible && !prevProps.visible) {
      this.setState({
        checkedGroups: toJS(this.props.store.panels).filter(item => item.type === 1)
      })
    }
  }

  handleClose = () => {
    this.setState({ page: 1 })
    this.props.onClose()
  }

  handleOk = async () => {
    const { store } = this.props
    const { checkedGroups } = this.state
    // 已存在的申请编辑和删除的用户组
    const existedGroupIds = store.panels
      .filter(item => item.type === 1 || item.type === 2)
      .map(getGroupId)

    // 获取新加的 和 需要撤销的 用户组id
    const addGroups = checkedGroups.filter(item => !existedGroupIds.includes(getGroupId(item)))
    const deleteGroupIds = existedGroupIds.filter(item =>
      checkedGroups.every(a => getGroupId(a) !== item)
    )

    if (addGroups.length > 0) {
      let groups = addGroups.map(group => fortmatGroup(group, { type: 1 }))
      groups = await getUserAndRoleList(groups)
      store.addEditGroups(groups)
    }
    if (deleteGroupIds.length > 0) {
      // 相当于撤销
      const newPanels = store.panels.filter(item => !deleteGroupIds.includes(getGroupId(item)))
      this.props.store.setProps({ panels: newPanels })
    }

    this.handleClose()
  }

  getTitle = () => {
    const { page, checkedGroups } = this.state

    return (
      <div>
        {page !== 1 ? (
          <>
            <LeftOutlined style={{ cursor: 'pointer' }} onClick={() => this.setState({ page: 1 })} />
            &nbsp;
          </>
        ) : null}
        {i18n('choose_group', '选择用户组')}
        <span
          className={styles.selectedText}
          onClick={() => this.setState({ page: 3 })}
        >{`已选中(${checkedGroups.length})个`}</span>
      </div>
    );
  }

  render() {
    const { serviceRange = [], visible } = this.props
    const { page, checkedGroups } = this.state

    return (
      <Modal
        wrapClassName={styles.modal}
        visible={visible}
        title={this.getTitle()}
        width={720}
        destroyOnClose
        onCancel={this.handleClose}
        onOk={this.handleOk}
      >
        <GroupList
          show={page === 1}
          serviceRange={serviceRange}
          checkedGroups={checkedGroups}
          onCheckGroups={groups => this.setState({ checkedGroups: groups })}
        />
        {page === 3 && (
          <SelectedGroupList
            serviceRange={serviceRange}
            checkedGroups={checkedGroups}
            onCheckGroups={groups => this.setState({ checkedGroups: groups })}
          />
        )}
      </Modal>
    )
  }
}
