import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Checkbox, Input, Tooltip, Select, Radio, Form } from '@uyun/components'
import TenantSelect from './TenantSelect'
import styles from './index.module.less'

const Option = Select.Option
const RadioGroup = Radio.Group
const FormItem = Form.Item

@inject('globalStore')
@observer
export default class TacheButtonConfig extends Component {
  static defaultProps = {
    isSubmit: false,  // 是否处于提交状态
    taches: [],  // 所有节点
    tacheInfo: {},  // 当前节点信息
    value: [],
    onChange: () => {}
  }

  state = {
    editingType: '', // 正在重命名的按钮
    editingName: '' // 正在编辑的按钮名称 
  }

  handleRenameOk = index => {
    const { editingName } = this.state

    this.handleChange(editingName, index, 'buttonName')
    this.handleRenameCancel()
  }

  handleRenameCancel = () => {
    this.setState({ editingType: '', editingName: '' })
  }

  handleChange = (val, index, field) => {
    const { value, onChange } = this.props
    const nextValue = value.slice()

    nextValue[index][field] = val

    if (field === 'remoteNodeMode') {
      nextValue[index].remoteNodeInfos = []
    }

    onChange(nextValue)
  }

  validateRemoteNodeInfo = tacheButton => {
    const { isSubmit } = this.props
    const { remoteNodeMode, remoteNodeInfo = tacheButton.remoteNodeInfos || [] } = tacheButton

    if (isSubmit && remoteNodeMode === 0 && remoteNodeInfo.length === 0) {
      return true
    }
    return false
  }

  getButtonName = type => {
    switch (type) {
      case 'reassignment':
        return i18n('globe.reassign', '改派')
      case 'cross_unit_reassignment':
        return '跨单位改派'
      case 'suspend':
        return i18n('status_10', '挂起')
      case 'add_multi_performer':
        return i18n('globe.addMultiPerformer', '增加会签人')
      case 'rollback':
        return i18n('globe.rollback', '回退')
      case 'close':
        return i18n('globe.close', '关闭')
      case 'abolish':
        return i18n('globe.abolish', '废除')
      case 'addSign':
        return i18n('globe.endorsement', '加签')
      case 'auto_approval':
        return i18n('globe.autoapproval', '自动审批')
      case 'remote_ticket':
        return '远程工单'
      default : return null
    }
  }

  render() {
    const { value, taches, tacheInfo } = this.props
    const { editingType, editingName } = this.state
    const { remoteTicket: showRemoteTIcket } = this.props.globalStore.configAuthor

    return (
      <div>
        {
          value.map((tacheButton, index) => {
            const {
              type,
              isUseable,
              buttonName,
              rollbackWay,
              rollbackTache,
              rollbackProcess,
              rollbackResumeType,
              remoteNodeMode,
              remoteNodeInfos
            } = tacheButton

            // 跨租户改派由全局开关控制
            if (type === 'cross_unit_reassignment' && window.crossUnitReassign !== '1') {
              return null
            }
            // 远程工单由全局开关控制
            if (type === 'remote_ticket' && !showRemoteTIcket) {
              return null
            }

            const canRename = [
              'reassignment',
              'cross_unit_reassignment',
              'suspend',
              'add_multi_performer',
              'rollback',
              'remote_ticket'
            ].includes(type)

            const rollBackText = (
              <div style={{ width: '220px' }}>
                <div>{i18n('userTask.rollback.tips2')}</div>
                <div>{i18n('userTask.rollback.tips3')}</div>
                <div>{i18n('userTask.rollback.tips4')}</div>
              </div>
            )

            return (
              <div key={type} className={styles.buttonWrapper}>
                <Checkbox
                  checked={Boolean(isUseable)}
                  onChange={e => this.handleChange(e.target.checked ? 1 : 0, index, 'isUseable')}
                >
                  {this.getButtonName(type)}
                </Checkbox>

                {/* 按钮重命名 */}
                {
                  canRename && (
                    editingType === type ? (
                      <>
                        <Input
                          style={{ width: 120 }}
                          maxLength={10}
                          value={editingName}
                          onChange={e => this.setState({ editingName: e.target.value })}
                        />
                        <i className="iconfont icon-dui icon1" onClick={() => this.handleRenameOk(index)} />
                        <i className="iconfont icon-cha icon2" onClick={() => this.handleRenameCancel(index)} />
                      </>
                    ) : (
                      <>
                        {buttonName ? <span className={styles.newName}>{`[${buttonName}]`}</span> : null}
                        <Tooltip title="功能重命名">
                          <i
                            className="iconfont icon-zhongmingming"
                            onClick={() => this.setState({ editingName: buttonName, editingType: type })}
                          />
                        </Tooltip>
                      </>
                    )
                  )
                }

                {
                  type === 'addSign' && (
                    <Tooltip title={i18n('conf.model.addSign.option2', '在当前节点之后增加新的审批节点')}>
                      <i className="iconfont icon-jinggao addSignTips" />
                    </Tooltip>
                  )
                }

                {
                  type === 'auto_approval' &&
                  <Tooltip title={i18n('globe.autoapproval.tip', '当前节点审批人员与上一节点审批人员相同时，自动审批通过')}>
                    <i className="iconfont icon-jinggao addSignTips" />
                  </Tooltip>
                }

                {/* 回退配置 */}
                {
                  !!isUseable && type === 'rollback' && (
                    <div className={styles.rollbackWrapper}>
                      <div className={styles.rollbackContent}>
                        <Select
                          style={{ width: '150px', display: 'inline-block' }}
                          getPopupContainer={() => document.getElementById('userTask')}
                          value={rollbackWay}
                          onChange={value => this.handleChange(value, index, 'rollbackWay')}
                        >
                          <Option value={0}>{i18n('conf.model.rollback.option2', '逐级回退')}</Option>
                          <Option value={1}>{i18n('conf.model.rollback.option3', '自由回退')}</Option>
                          <Option value={2}>{i18n('conf.model.rollback.option4', '定点回退')}</Option>
                        </Select>
                        <Tooltip placement="bottom" title={rollBackText}>
                          <i className="iconfont icon-jinggao rollbackTips" />
                        </Tooltip>
                        {
                          rollbackWay === 2 && (
                            <Select
                              style={{ width: '150px', display: 'inline-block' }}
                              getPopupContainer={() => document.getElementById('userTask')}
                              labelInValue
                              value={rollbackTache || {}}
                              onChange={value => this.handleChange(value, index, 'rollbackTache')}
                            >
                              {
                                taches.map(item => {
                                  if (['UserTask', 'StartNoneEvent'].includes(item.activitiType) && item.id !== tacheInfo.id) {
                                    return <Option key={item.id} value={item.id}>{item.text}</Option>
                                  }
                                })
                              }
                            </Select>
                          )
                        }
                        <Checkbox
                          checked={!!rollbackProcess}
                          onChange={e => this.handleChange(e.target.checked ? 1 : 0, index, 'rollbackProcess')}
                        >
                          {i18n('system.rollback.tips', '优先回退到处理组，无处理组则回退到处理人')}
                        </Checkbox>
                        {
                          (rollbackWay === 1 || rollbackWay === 2) && (
                            <>
                              <Checkbox
                                style={{ marginLeft: 0 }}
                                checked={rollbackResumeType === 1}
                                onChange={e => this.handleChange(e.target.checked ? 1 : 0, index, 'rollbackResumeType')}
                              >
                                {i18n('quickly.rollback.option.label', '回退后再提交将直达当前节点')}
                              </Checkbox>
                              <Checkbox
                                style={{ marginLeft: 0 }}
                                checked={rollbackResumeType === 2}
                                onChange={e => this.handleChange(e.target.checked ? 2 : 0, index, 'rollbackResumeType')}
                              >
                                {i18n('quickly.rollback.option.label2', '处理人选择回退再提交方式')}
                              </Checkbox>
                            </>
                          )
                        }
                      </div>
                    </div>
                  )
                }

                {/* 远程工单配置 */}
                {
                  !!isUseable && type === 'remote_ticket' && (
                    <div className={styles.rollbackWrapper}>
                      <div className={styles.rollbackContent}>
                        <RadioGroup
                          value={remoteNodeMode}
                          onChange={e => this.handleChange(e.target.value, index, 'remoteNodeMode')}
                        >
                          <Radio value={0}>固定节点</Radio>
                          <Radio value={1}>人工选择</Radio>
                        </RadioGroup>
                        <FormItem
                          validateStatus={this.validateRemoteNodeInfo(tacheButton) ? 'error' : 'success'}
                          help={this.validateRemoteNodeInfo(tacheButton) ? '请选择租户' : ''}
                        >
                          <TenantSelect
                            multiple={remoteNodeMode === 1}
                            value={remoteNodeInfos}
                            onChange={value => this.handleChange(value, index, 'remoteNodeInfos')}
                          />
                        </FormItem>
                      </div>
                    </div>
                  )
                }
              </div>
            )
          })
        }
      </div>
    )
  }
}
