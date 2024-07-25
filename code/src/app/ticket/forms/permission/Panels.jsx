import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { Button, Collapse } from '@uyun/components'
import cls from 'classnames'
import moment from 'moment'
import SelectionGroupForm from './SelectionGroupForm'
import AdminGroupForm from './AdminGroupForm'
import OldDataPanel from './OldDataPanel'
import './AdminGroupForm/index.less'
import { calcDelStatus, GROUP_OPER_STATUS } from './logic'

const Panel = Collapse.Panel

const statusMap = {
  1: i18n('to-approve', '待审批'),
  2: i18n('take-effect', '已生效'),
  3: i18n('has-reject', '已驳回')
}

function getDisabled(disabled, group) {
  const { status } = group
  // 已生效或已驳回的也要disable掉
  const isEffect = status === 2 || status === 3
  return disabled || isEffect
}

@observer
class Panels extends Component {
  static defaultProps = {
    store: {},
    serviceRange: [],
    disabled: false
  }

  handleCollapseChange = (activeGroupIds) => {
    this.props.store.setProps({ activeGroupIds })
  }

  handleSeletionRevoke = (e, panel) => {
    e.stopPropagation()
    const { panels } = this.props.store
    const newPanels = panels.filter((item) => item.rowId !== panel.rowId)

    this.props.store.setProps({ panels: newPanels })
  }

  handleAdminDel = (e, status, group) => {
    e.stopPropagation()
    const { panels } = this.props.store
    if (status === 1) {
      // 撤销
      const newPanels = panels.filter((item) => item.rowId !== group.rowId)
      this.props.store.setProps({ panels: newPanels })
    } else if (status === 2 || status === 3) {
      // 删除用户组 或者 撤销删除
      const newPanels = panels.map((item) => {
        return item.rowId === group.rowId ? { ...item, type: status === 2 ? 2 : 1 } : item
      })
      this.props.store.setProps({ panels: newPanels })
    }
  }

  getSelectionExtra(panel) {
    const { disabled, isRequired } = this.props
    const { creator, createTime, status } = panel
    return (
      <div className="panel-extra-wrapper">
        <span className="panel-extra-text-wrapper">
          {statusMap[status] && <span>{statusMap[status]}</span>}
          {creator && <span>{`${i18n('application', '申请')}: ${creator}`}</span>}
          {createTime && <span>{moment(createTime).format('YYYY-MM-DD HH:mm')}</span>}
          {!disabled && (
            <Button
              onClick={(e) => this.handleSeletionRevoke(e, panel)}
              disabled={isRequired === 2}
            >
              {i18n('withdraw', '撤销')}
            </Button>
          )}
        </span>
      </div>
    )
  }

  getAdminExtra(panel) {
    const { isRequired } = this.props
    const { creator, createTime, status, type } = panel
    const disabled = getDisabled(this.props.disabled, panel)
    const delStatus = calcDelStatus(type, status)
    const delStatusMap = {
      2: i18n('delete-permission-group', '删除用户组'),
      3: i18n('withdraw-delete-permission-group', '取消删除')
    }
    return (
      <div className="panel-extra-wrapper">
        <span className="panel-extra-text-wrapper">
          {statusMap[status] && <span>{statusMap[status]}</span>}
          {creator && <span>{`${i18n('application', '申请')}: ${creator}`}</span>}
          {createTime && <span>{moment(createTime).format('YYYY-MM-DD HH:mm')}</span>}
          {delStatusMap[delStatus] && !disabled && (
            <Button
              onClick={(e) => this.handleAdminDel(e, delStatus, panel)}
              disabled={isRequired === 2}
            >
              {delStatusMap[delStatus]}
            </Button>
          )}
          {!disabled && (
            <Button onClick={(e) => this.handleAdminDel(e, 1, panel)} disabled={isRequired === 2}>
              {i18n('withdraw', '撤销')}
            </Button>
          )}
        </span>
      </div>
    )
  }

  getAdminHeader(panel) {
    const { serviceRange } = this.props
    const { type, status, name, appId } = panel

    // const app = serviceRange.find(item => item.appId === appId)
    // const preName = app ? app.enName + ' - ' + app.appName + ' / ' : ''
    // const getName = name => preName + name
    const getName = () =>
      type === 0 ? i18n('create-user-group', '新建用户组') : i18n('edit-user-group', '编辑用户组')
    // if (!name) return getName(i18n('create-user-group', '新建用户组'))

    // 待提交时不显示状态
    if (status === 0) return getName(name)
    const [symbol, className] = GROUP_OPER_STATUS[type]
    if (!symbol) return getName(name)
    return (
      <span>
        <span>{getName(name)}</span>
        <span className={cls('permission-diff-status', className)}>
          [<span className="symbol">{symbol}</span>]
        </span>
      </span>
    )
  }

  render() {
    const { store, disabled, serviceRange, serviceCode, isRequired } = this.props
    const { panels, activeGroupIds } = store

    // 老数据中的加入和退出的用户组
    const oldGroups = panels.filter((item) => item.old)
    const normalPanels = panels.filter((item) => !item.old)

    return (
      <div className="permission-wrapper">
        <div className="permisssion-groups">
          <Collapse activeKey={toJS(activeGroupIds)} onChange={this.handleCollapseChange}>
            {oldGroups.length > 0 && (
              <Panel key="old" header="用户组申请">
                <OldDataPanel groups={oldGroups} isRequired={isRequired} />
              </Panel>
            )}
            {normalPanels.map((panel) => {
              const { rowId, type } = panel

              if (type === 3 || type === 4) {
                const header =
                  panel.type === 3
                    ? i18n('apply.join.group', '申请加入用户组')
                    : i18n('apply.quit.group', '申请退出用户组')
                return (
                  <Panel key={rowId} header={header} extra={this.getSelectionExtra(panel)}>
                    <SelectionGroupForm
                      serviceCode={serviceCode}
                      store={store}
                      group={panel}
                      disabled={disabled}
                      serviceRange={serviceRange}
                      isRequired={isRequired}
                    />
                  </Panel>
                )
              }
              return (
                <Panel
                  key={rowId}
                  header={this.getAdminHeader(panel)}
                  extra={this.getAdminExtra(panel)}
                >
                  <AdminGroupForm
                    store={store}
                    group={panel}
                    disabled={disabled}
                    serviceRange={serviceRange}
                    isRequired={isRequired}
                  />
                </Panel>
              )
            })}
          </Collapse>
        </div>
      </div>
    )
  }
}
export default Panels
