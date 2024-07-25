import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { toJS, action } from 'mobx'
import moment from 'moment'
import { Button, Form, Input, Tooltip, Table, Tag, Select } from '@uyun/components'
import cls from 'classnames'
import AddUserModal from './AddUserModal'
import RemoveUserModal from './RemoveUserModal'
import AddRoleModal from './AddRoleModal'
import RemoveRoleModal from './RemoveRoleModal'
import './index.less'
import {
  validateName,
  validateCode,
  validateApp,
  getFormItemDiffStatus,
  findGroupById,
  userModalColumns
} from '../logic'

const FormItem = Form.Item
const TextArea = Input.TextArea
const Option = Select.Option

const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 21 }
}

const shortFormItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 14 }
}

function getDisabled(disabled, group) {
  const { status } = group
  // 已生效或已驳回的也要disable掉
  const isEffect = status === 2 || status === 3
  return disabled || isEffect
}

@observer
class AdminGroupForm extends Component {
  componentDidMount() {
    const { group } = this.props
    if (!group.code) {
      const code = `SD${moment().format('YYYYMMDDHHmmss')}`
      this.handleCodeChange(code)
    }
  }
  @action
  handleNameChange = (group) => (e) => {
    const value = e.target.value
    group.name = value
    group.nameInfo = validateName(value)
  }

  @action
  handleCodeChange = (value) => {
    const { group } = this.props
    group.code = value
    group.codeInfo = validateCode(value)
  }

  @action
  handleAppChange = (group) => (value) => {
    group.appId = value
    group.appInfo = validateApp(value)
  }

  @action
  handleDescriptionChange = (group) => (e) => {
    group.description = e.target.value
  }

  @action
  withDrawUser = (groupId, userId) => {
    const group = findGroupById(this.props.store.panels, groupId)
    if (!group) return
    group.relatedUsers = group.relatedUsers.filter((user) => user.userId !== userId)
  }

  @action
  withDrawRole = (groupId, roleId) => {
    const group = findGroupById(this.props.store.panels, groupId)
    if (!group) return
    group.relatedRoles = group.relatedRoles.filter((role) => role.roleId !== roleId)
  }

  renderDisableEle(value, originalValue, type) {
    const diff = getFormItemDiffStatus(value, originalValue, type)
    let diffSymbol, symbol, className
    if (diff) {
      ;[symbol, className] = diff
      diffSymbol = (
        <span className={cls('permission-diff-status', className)}>
          [<span className="symbol">{symbol}</span>]
        </span>
      )
    } else {
      diffSymbol = null
    }
    const ele = (
      <div className="pre-wrap disabled-ticket-form">
        <span>{value}</span>
        {diffSymbol}
      </div>
    )
    if (className === 'modify') {
      return (
        <Tooltip title={`${i18n('before-modify', '修改前')}: ${originalValue}`}>
          <span style={{ cursor: 'pointer' }}>{ele}</span>
        </Tooltip>
      )
    }
    return ele
  }

  renderDisableApp(appId) {
    const { serviceRange } = this.props
    const app = serviceRange.find((item) => item.appId === appId)

    if (app) {
      return (
        <div className="pre-wrap disabled-ticket-form">
          <span>{app.enName + ' - ' + app.appName}</span>
        </div>
      )
    }

    return null
  }

  render() {
    const { group, serviceRange, isRequired } = this.props
    const {
      rowId,
      name,
      originalName,
      nameInfo = {},
      code,
      originalCode,
      codeInfo = {},
      appId,
      appInfo = {},
      description,
      originalDescription,
      relatedUsers = [],
      applicationId,
      relatedRoles,
      type,
      userList,
      roleList
    } = group

    const iApplyEdit = type === 1
    const isApplyDelete = type === 2
    const disabled = getDisabled(this.props.disabled, group)

    const userColumns = [
      ...userModalColumns,
      {
        dataIndex: 'type',
        title: i18n('application-type', '申请类型'),
        render: (type) =>
          type === 0 ? i18n('apply-to-add', '申请添加') : i18n('apply-to-remove', '申请移除')
      },
      !disabled && {
        dataIndex: 'operate',
        title: i18n('operate', '操作'),
        render: (_, user) => (
          <Button onClick={() => this.withDrawUser(rowId, user.userId)} disabled={isApplyDelete}>
            {i18n('withdraw', '撤销')}
          </Button>
        )
      }
    ].filter(Boolean)

    const modalProps = { store: this.props.store, group }
    return (
      <div className="permission-group-wrapper">
        <FormItem
          label={i18n('permission-name', '名称')}
          {...shortFormItemLayout}
          required={!disabled}
          validateStatus={nameInfo.validateStatus || 'success'}
          help={nameInfo.help || ''}
        >
          <Input
            value={name}
            onChange={this.handleNameChange(group)}
            placeholder={i18n('permission-code-placeholder', '请输入名称')}
            className={cls({ 'disabled-item': disabled })}
            disabled={disabled || isApplyDelete}
            maxLength={50}
          />
          {disabled && this.renderDisableEle(name, originalName, type)}
        </FormItem>

        <FormItem
          label={i18n('permission-code', '编码')}
          {...shortFormItemLayout}
          required={!disabled}
          validateStatus={codeInfo.validateStatus || 'success'}
          help={codeInfo.help || ''}
        >
          <Input
            value={code}
            placeholder={i18n('code-reg-error', '编码只能包含字母、数字、下划线')}
            className={cls({ 'disabled-item': disabled })}
            // 创建工单后，该字段就不可编辑了
            disabled
          />
          {disabled && this.renderDisableEle(code, originalCode, type)}
        </FormItem>

        <FormItem
          {...shortFormItemLayout}
          label={i18n('app', '应用')}
          required={!disabled}
          validateStatus={appInfo.validateStatus || 'success'}
          help={appInfo.help || ''}
        >
          <Select
            placeholder={i18n('please.select.app', '请选择应用')}
            className={cls({ 'disabled-item': disabled })}
            disabled={typeof applicationId !== 'undefined' || isApplyDelete || iApplyEdit}
            value={appId}
            onChange={this.handleAppChange(group)}
          >
            {serviceRange.map((item) => (
              <Option key={item.appId}>{item.enName + ' - ' + item.appName}</Option>
            ))}
          </Select>
          {disabled && this.renderDisableApp(appId)}
        </FormItem>

        <FormItem
          label={i18n('permission-description', '描述')}
          placeholder={i18n('please-input', '请输入')}
          {...formItemLayout}
          style={{ display: disabled && _.isEmpty(description) ? 'none' : 'black' }}
        >
          <div style={{ display: disabled ? 'none' : 'inline-block', width: '100%' }}>
            <TextArea
              value={description}
              onChange={this.handleDescriptionChange(group)}
              maxLength={50}
              disabled={disabled || isApplyDelete}
              autosize={{ minRows: 2 }}
              rows={20}
            />
          </div>
          {disabled && this.renderDisableEle(description, originalDescription, type)}
        </FormItem>

        <FormItem label={i18n('permission-auth-users', '授权用户')} {...formItemLayout}>
          {!disabled && (
            <div className="permission-btns">
              <AddUserModal {...modalProps}>
                <Button disabled={isApplyDelete || isRequired === 2}>
                  {i18n('add-permission-user', '添加用户')}
                </Button>
              </AddUserModal>
              {userList.length > 0 && (
                <RemoveUserModal {...modalProps}>
                  <Button disabled={isApplyDelete || isRequired === 2}>
                    {i18n('remove-permission-user', '移除用户')}
                  </Button>
                </RemoveUserModal>
              )}
            </div>
          )}
          {relatedUsers.length > 0 && (
            <Table
              rowKey="userId"
              columns={userColumns}
              dataSource={toJS(relatedUsers)}
              pagination={{ size: 'small', pageSize: 10, hideOnSinglePage: true }}
              bordered={false}
              style={{ marginTop: 15 }}
            />
          )}
        </FormItem>

        <FormItem label={i18n('permission-auth-roles', '授权角色')} {...formItemLayout}>
          {!disabled && (
            <div className="permission-btns">
              <AddRoleModal {...modalProps}>
                <Button disabled={isApplyDelete || isRequired === 2}>
                  {i18n('add-permission-role', '添加角色')}
                </Button>
              </AddRoleModal>
              {roleList.length > 0 && (
                <RemoveRoleModal {...modalProps}>
                  <Button disabled={isApplyDelete || isRequired === 2}>
                    {i18n('remove-permission-role', '移除角色')}
                  </Button>
                </RemoveRoleModal>
              )}
            </div>
          )}

          {relatedRoles.length > 0 && (
            <div>
              {relatedRoles.map((role) => {
                const { roleId, roleName, type } = role
                const className = type === 0 ? 'role-tag-add' : 'role-tag-remove'
                const symbol = type === 0 ? '+' : '-'
                return (
                  <Tag
                    key={roleId}
                    className={className}
                    closable={!disabled && !isApplyDelete}
                    onClose={() => this.withDrawRole(rowId, roleId)}
                  >
                    {roleName} [{symbol}]
                  </Tag>
                )
              })}
            </div>
          )}
        </FormItem>
      </div>
    )
  }
}
export default AdminGroupForm
