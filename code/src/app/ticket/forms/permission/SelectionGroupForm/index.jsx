import React, { Component } from 'react'
import { toJS, action } from 'mobx'
import { observer } from 'mobx-react'
import { Button, Form, Table, Tag, Tooltip } from '@uyun/components'
import AddUserModal from '../AdminGroupForm/AddUserModal'
// import AddGroupsModal from './AddGroupsModal'
import AddGroupsModal from './GroupSelectModal'
import { findGroupById, userModalColumns } from '../logic'

const FormItem = Form.Item

const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 21 }
}

@observer
class SelectionGroupForm extends Component {
  @action
  withDrawUser = (rowId, userId) => {
    const group = findGroupById(this.props.store.panels, rowId)
    if (!group) return
    group.relatedUsers = group.relatedUsers.filter((user) => user.userId !== userId)
  }

  @action
  handleGroupRevoke = (rowId, code) => {
    const group = findGroupById(this.props.store.panels, rowId)
    if (!group) return
    group.relatedGroups = group.relatedGroups.filter((group) => group.code !== code)
  }

  renderSelectGroupBtn = () => {
    const { disabled, group, serviceRange, store, serviceCode, isRequired } = this.props
    const { type, relatedUsers } = toJS(group)

    if (disabled) {
      return null
    }

    // 退出用户组时，未选择用户时不能选择用户组
    // const canSelectGroups = type === 3 || (type === 4 && relatedUsers.length > 0)
    const canSelectGroups = true // 逻辑改了，这边放开了
    // 能选择用户组时用Modal包裹，否则用Tooltip包裹作提示
    const Wrapper = canSelectGroups ? AddGroupsModal : Tooltip
    const wrapperProps = canSelectGroups
      ? { store, group, serviceRange, serviceCode }
      : { title: i18n('please.add.user.first', '请先添加用户') }

    return (
      <Wrapper {...wrapperProps}>
        <Button disabled={!canSelectGroups || isRequired === 2}>
          {i18n('choose_group', '选择用户组')}
        </Button>
      </Wrapper>
    )
  }

  render() {
    const { group, disabled, isRequired } = this.props
    const { rowId, relatedUsers, relatedGroups, usersInfo, groupsInfo } = toJS(group)

    const userColumns = [
      ...userModalColumns,
      // {
      //   dataIndex: 'type',
      //   title: i18n('application-type', '申请类型'),
      //   render: type => type === 0 ? i18n('apply-to-add', '申请添加') : i18n('apply-to-remove', '申请移除')
      // },
      !disabled && {
        dataIndex: 'operate',
        title: i18n('operate', '操作'),
        render: (_, user) => (
          <Button onClick={() => this.withDrawUser(rowId, user.userId)} disabled={isRequired === 2}>
            {i18n('withdraw', '撤销')}
          </Button>
        )
      }
    ].filter(Boolean)

    return (
      <div className="permission-group-wrapper">
        <FormItem
          {...formItemLayout}
          label={i18n('apply.user', '申请用户')}
          required
          {...usersInfo}
        >
          {!disabled && (
            <div className="permission-btns">
              <AddUserModal store={this.props.store} group={group}>
                <Button disabled={isRequired === 2}>
                  {i18n('add-permission-user', '添加用户')}
                </Button>
              </AddUserModal>
            </div>
          )}
          {relatedUsers.length > 0 && (
            <Table
              rowKey="userId"
              size="small"
              columns={userColumns}
              dataSource={relatedUsers}
              pagination={{ size: 'small', pageSize: 10, hideOnSinglePage: true }}
              bordered={false}
              style={{ marginTop: 15 }}
            />
          )}
        </FormItem>

        <FormItem {...formItemLayout} label={i18n('user_group', '用户组')} required {...groupsInfo}>
          {this.renderSelectGroupBtn()}
          <div>
            {relatedGroups.map((item) => (
              <Tag
                key={item.code}
                closable={!disabled && isRequired !== 2}
                onClose={() => this.handleGroupRevoke(rowId, item.code)}
              >
                {item.name}
              </Tag>
            ))}
          </div>
        </FormItem>
      </div>
    )
  }
}

export default SelectionGroupForm
