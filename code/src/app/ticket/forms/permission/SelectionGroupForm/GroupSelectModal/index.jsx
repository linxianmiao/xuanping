import React, { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import { LeftOutlined } from '@uyun/icons';
import { Modal, Icon } from '@uyun/components'
import GroupList from './GroupList'
import SelectedGroupList from './SelectedGroupList'
import styles from './index.module.less'

@inject('permissionListStore')
@observer
export default class GroupSelectModal extends Component {
  state = {
    visible: false,
    page: 1 // 1:用户组列表 3:选中列表
  }

  handleCheck = groups => {
    this.props.store.setProps({ selectedGroups: groups })
  }

  handleOpen = group => {
    this.setState({ visible: true })
    this.props.store.setProps({
      currentGroup: group,
      selectedGroups: group.relatedGroups.slice()
    })
  }

  handleClose = () => {
    this.setState({
      page: 1,
      visible: false
    })
    this.props.store.setProps({
      currentGroup: null,
      selectedGroups: []
    })
  }

  handleOk = async () => {
    this.props.store.currentGroup.relatedGroups = toJS(this.props.store.selectedGroups)
    this.handleClose()
  }

  getTitle = () => {
    const { page } = this.state
    const checkedGroups = toJS(this.props.store.selectedGroups)

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
    const { serviceRange = [], group } = this.props
    const { visible, page } = this.state
    const selectedGroups = toJS(this.props.store.selectedGroups)

    return (
      <>
        {React.Children.map(this.props.children, child =>
          React.cloneElement(child, {
            onClick: () => this.handleOpen(group)
          })
        )}
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
            checkedGroups={selectedGroups}
            onCheckGroups={groups => this.handleCheck(groups)}
          />
          {page === 3 && (
            <SelectedGroupList
              checkedGroups={selectedGroups}
              onCheckGroups={groups => this.handleCheck(groups)}
            />
          )}
        </Modal>
      </>
    )
  }
}
