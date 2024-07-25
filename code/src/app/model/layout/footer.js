import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { withRouter, Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { DownOutlined } from '@uyun/icons'
import { Button, message, Modal, Dropdown, Menu } from '@uyun/components'
import EditInput from './EditInput'
import LowcodeLink, { linkTo } from '~/components/LowcodeLink'
import { Injectable, Inject } from '@uyun/everest-injectable'
import { getUserLength, checkHandlersRangeVo } from '../component/flow/utils'
import FlowStore from '../store/flowStore'
import { orLowcode } from '~/utils/common'
import './style/footer.less'
import _ from 'lodash'
import { toJS } from 'mobx'

@withRouter
@inject('basicInfoStore', 'leaveStore', 'globalStore', 'formSetGridStore', 'flowListStore')
@Injectable({ cooperate: 'mobx' })
@observer
class Footer extends Component {
  @Inject(FlowStore) flowStore

  constructor(props) {
    super(props)
    this.flowMesRef = React.createRef()
    this.state = {
      loading: false
    }
  }

  static contextTypes = {
    modelId: PropTypes.string
  }

  handleOk = () => {
    const { visibleKey, getTabPaneData } = this.props
    if (visibleKey === '1') {
      getTabPaneData('basicinfo', this.saveBasicInfo)
    }
  }

  saveBasicInfo = async (value) => {
    const callback = () => {
      this.props.leaveStore.setBasicInfoSave(0)
      message.success(i18n('save_success', '保存成功'))
    }
    const basicInfoData = _.assign(value, { mode: 1, id: this.context.modelId })
    this.setState({ loading: true })
    await this.props.basicInfoStore.saveBaseModel(basicInfoData, callback)
    // 编辑表单之后看下要不要自动审核
    this.changeModelStatus()
    this.setState({ loading: false })
  }

  // 流程图的保存和发布
  saveFlow = (type, forceUpdate) => {
    if (this.checkFlow()) {
      return false
    }
    const { modelId } = this.context
    const { chartId, chartType, data: processes } = this.props.flowListStore
    this.flowStore.changeSubmit(false)
    const { version, versionList } = this.flowStore
    // 当前的版本
    const { status: currentStatus } = _.find(versionList, (item) => item.version === version) || {}
    // 0 历史版本，已经发布过的版本 ， 1 正在使用的版本，已经发布正在使用 ， 2 设计中，未发布的版本，不能被使用
    // 查看历史版本，不可保存更新此版本，不可发布为使用中，可保存为新版本
    // 查看使用中版本时，可以覆盖当前版本发布，可以发布未新的版本
    // 查看设计中版本时，可保存更新此版本，可发布为使用中。当新版本发布为使用中后，之前使用中的版本状态变更为历史
    const onOk = async () => {
      if (_.get(this.flowMesRef, 'current.state.editing')) {
        return false
      }
      console.log(
        '1111111111',
        toJS(processes),
        toJS(chartType),
        _.get(this.flowMesRef, 'current.state.value'),
        forceUpdate
      )
      const res = await this.flowStore.saveFlow(
        modelId,
        type,
        _.get(this.flowMesRef, 'current.state.value'),
        forceUpdate,
        chartId,
        chartType,
        processes
      )
      if (!_.isEmpty(res)) {
        const { version } = res
        const mes =
          type === 'save'
            ? i18n('save_success', '保存成功')
            : i18n('public-template-success', '发布成功')
        message.success(mes)
        this.flowStore.getModelProcessChart(modelId, chartId, version)
        this.flowStore.getChartVersions(modelId, chartId)
        this.props.formSetGridStore.getGridList(modelId)
        this.props.leaveStore.setFlowSave(0)
        // 编辑表单之后看下要不要自动审核
        this.changeModelStatus()
      }
    }
    if (currentStatus === 1 && forceUpdate) {
      Modal.confirm({
        title: i18n('model-processchart-save-tip3', '确定覆盖当前版本?'),
        content: i18n(
          'model-processchart-save-tip4',
          '覆盖后，该版本对应的历史工单可能会不可用，请酌情考虑'
        ),
        onOk: onOk
      })
    } else if (currentStatus === 0 || (currentStatus === 1 && !forceUpdate)) {
      this.flowModal = Modal.confirm()
      this.flowModal.update({
        title:
          type === 'save'
            ? i18n('model-processchart-save-tip1', '确定保存新模型')
            : i18n('model-processchart-publish-tip1', '确定发布新模型'),
        content: (
          <EditInput
            ref={this.flowMesRef}
            modal={this.flowModal}
            defaultValue={i18n('model-processchart-publish-tip3', '数据源自 V{version} 版本', {
              version
            })}
          />
        ),
        onOk: onOk
      })
    } else if (type === 'publish') {
      Modal.confirm({
        title: i18n('model-processchart-publish-tip1', '确定发布新模型'),
        onOk: onOk
      })
    } else {
      onOk()
    }
  }

  // 删除流程图
  handleDelChart = () => {
    const { modelId } = this.context
    const { version, versionList } = this.flowStore
    const versionObj = _.find(versionList, (item) => item.version === version) || {}
    const { status } = versionObj
    if (status === 1) {
      Modal.warning({
        title: i18n('model-processchart-del-tip1', '发布并使用的表单不能删除')
      })
    } else {
      Modal.confirm({
        title: i18n('model-processchart-del-tip2', '确定删除模型 "V{version}"版本', { version }),
        okText: i18n('delete', '删除'),
        okType: 'danger',
        onOk: async () => {
          const res = await this.flowStore.delChartVersions(modelId)
          if (res) {
            // 删除成功以后跳转到当前使用的流程图版本
            message.success(i18n('delete_success', '删除成功'))
            const { chartId } = this.props.flowListStore
            await this.flowStore.getChartVersions(modelId, chartId)
            const currentVersion = _.find(versionList, (item) => item.status === 1) || {}
            this.flowStore.getModelProcessChart(modelId, chartId, currentVersion.version)
          } else {
            // 删除失败弹框提示原因
            Modal.error({
              title: i18n('model-processchart-del-tip3', '删除失败'),
              content: i18n('model-processchart-del-tip4', '存在使用该版本的工单')
            })
          }
        }
      })
    }
  }

  // 校验流程图
  checkFlow = () => {
    const { dataSource, sensitiveAndexecAuth } = this.flowStore
    let tmp = false // 校验通过的开关
    let tmp1 = false
    // let tmp2 = false
    let olaStrategyFlag = false // 校验逾期策略的标记
    let olaStrategyOutGoingFlag = false // 校验逾期策略审批迁出路径的标记

    this.flowStore.changeSubmit(true)
    // 校验
    _.map(dataSource.links, (link) => {
      delete link.style
      const flowCode = _.trim(link.flowCode)
      if (
        !link.to.id ||
        !link.from.id ||
        !link.text ||
        !flowCode ||
        link.text.length > 20 ||
        flowCode.length < 2 ||
        flowCode.length > 20
      ) {
        tmp = true
        link.style = { stroke: 'red', fill: 'red' }
      }
    })
    _.map(dataSource.nodes, (node) => {
      delete node.style
      const activityCode = _.trim(node.activityCode)
      const sensitive = (sensitiveAndexecAuth[node.id] || {}).sensitive
      if (
        !node.text ||
        !activityCode ||
        node.text.length > 50 ||
        activityCode.length < 2 ||
        activityCode.length > 20
      ) {
        tmp = true
        node.style = { stroke: 'red' }
      }
      if (
        _.includes(
          ['StartNoneEvent', 'EndNoneEvent', 'AutoTask', 'autoPay', 'RemoteRequest'],
          node.activitiType
        ) &&
        _.isEmpty(node.formId)
      ) {
        tmp = true
        node.style = { stroke: 'red' }
      }
      if (node.activitiType === 'AutomaticDelivery' && !node.sceneType) {
        tmp = true
        node.style = { stroke: 'red' }
      }
      if (node.activitiType === 'AutoTask') {
        node.policy = 3
      }
      // let AutoTaskNode = node.activitiType === 'AutoTask' && node.dealRules[0].autoType !== 2
      if (
        (node.activitiType === 'UserTask' ||
          node.activitiType === 'ApprovalTask' ||
          node.activitiType === 'RemoteRequest' ||
          (node.activitiType === 'AutoTask' && node.dealRules[0].autoType !== 2) ||
          (node.activitiType === 'AutomaticDelivery' && node.autoExecutionType === '1')) &&
        (checkHandlersRangeVo(node.handlersRangeVo) ||
          (node.activitiType !== 'RemoteRequest' && !node.policy) ||
          !node.formId ||
          (+node.needApproval === 1 && getUserLength(node.reviewers) < 1) ||
          (node.isSelectShielding && getUserLength(node.shieldingList) < 1))
      ) {
        tmp = true
        node.style = { stroke: 'red' }
      }

      if (node?.isCheckedTenant) {
        if (
          _.isEmpty(node?.cooperateTenant) ||
          (!_.isEmpty(node?.cooperateTenant) && _.isEmpty(node?.cooperateTenant?.tenantId))
        ) {
          tmp = true
          node.style = { stroke: 'red' }
        }
      }
      if (node && node?.policy === 5) {
        if (_.isEmpty(node?.forwardActivityList)) {
          tmp = true
          node.style = { stroke: 'red' }
        }
      }
      if (node.activitiType === 'UserTask' || node.activitiType === 'ApprovalTask') {
        // 处理时长、逾期策略校验
        if (node.olaMonitorVos) {
          node.olaMonitorVos.forEach((item) => {
            if (item.useTimingMonitor) {
              // 日期时间变量
              if (item.useDateVariable && !item.dateVariable) {
                tmp = true
                node.style = { stroke: 'red' }
              }
              // 逾期策略
              const i = node.olaStrategyList
                ? node.olaStrategyList.findIndex((oItem) => oItem.olaId === item.id)
                : -1
              if (i === -1) {
                olaStrategyFlag = true
                node.style = { stroke: 'red' }
              }
            }
          })
        }

        if (node.olaStrategyList) {
          node.olaStrategyList.forEach((item) => {
            // 校验迁出路径是否存在
            const approveAction = item.params.find((action) => action.type === 'approveTicket')

            if (approveAction) {
              const { outFlowId } = approveAction.executeParamPos[0].value || {}
              if (!node.outGoings.includes(outFlowId)) {
                olaStrategyOutGoingFlag = true
                node.style = { stroke: 'red' }
              }
            }
          })
        }

        // 异常处理
        if (node.exceptionStrategyVo) {
          const { isAssignUsers, assignUsers } = node.exceptionStrategyVo
          if (isAssignUsers === 1 && _.isEmpty(assignUsers)) {
            tmp = true
            node.style = { stroke: 'red' }
          }
        }

        // // 勾选远程工单按钮时，如果选择固定节点，则租户必选
        // const remoteTicketButton = node.tacheButton.find(item => item.type === 'remote_ticket')
        // const { isUseable, remoteNodeMode, remoteNodeInfos } = remoteTicketButton || {}
        // if (isUseable && remoteNodeMode === 0 && _.isEmpty(remoteNodeInfos)) {
        //   tmp = true
        //   node.style = { stroke: 'red' }
        // }
        // // 定点回退时，回退节点不能为空
        // const rollbackButton = _.find(node.tacheButton, item => item.type === 'rollback') || {}
        // if (rollbackButton.rollbackWay === 2 && !rollbackButton.rollbackTache) {
        //   tmp = true
        //   node.style = { stroke: 'red' }
        // }
      }

      if (node.activitiType === 'AutoTask' && node.dealRules[0].autoType !== 2) {
        // 执行时间判断
        // if (+node.dealRules[0].executionStrategy === 0) {
        //   if (node.dealRules[0].executionTime.selectType === 'value' && !node.dealRules[0].executionTime.execTime) {
        //     tmp2 = true; node.style = { stroke: 'red' }
        //   }
        //   if (node.dealRules[0].executionTime.selectType === 'field' && !node.dealRules[0].executionTime.execTimeFieldCode) {
        //     tmp2 = true; node.style = { stroke: 'red' }
        //   }
        // }

        // if (+node.dealRules[0].executionStrategy === 1) {
        //   if (node.dealRules[0].executionTime.selectType === 'value' && (!node.dealRules[0].executionTime.execTime || !node.dealRules[0].executionTime.deadTime)) {
        //     tmp2 = true; node.style = { stroke: 'red' }
        //   }
        //   if (node.dealRules[0].executionTime.selectType === 'field' && (!node.dealRules[0].executionTime.execTimeFieldCode || !node.dealRules[0].executionTime.deadTimeFieldCode)) {
        //     tmp2 = true; node.style = { stroke: 'red' }
        //   }
        // }
        if (node.executeType) {
          if (
            !_.isNumber(node.dealRules[0]?.needWaitWhenExecuteException) ||
            (_.isNumber(node.dealRules[0]?.needWaitWhenExecuteException) &&
              !!node.dealRules[0]?.needWaitWhenExecuteException)
          ) {
            tmp = true
            node.style = { stroke: 'red' }
          }
        }

        if (!node.dealRules[0].autoCode && !node.dealRules[0].autoId) {
          tmp = true
          node.style = { stroke: 'red' }
        }
        _.forEach(node.dealRules[0].autoParams, (param) => {
          if (param.required && !param.value) {
            tmp = true
            node.style = { stroke: 'red' }
          }
        })
        if (node.dealRules[0].hasOwnProperty('executionStrategy')) {
          if (
            sensitive &&
            _.isEmpty(
              _.concat(
                node.dealRules[0].sensitiveAuthor.users,
                node.dealRules[0].sensitiveAuthor.groups
              )
            )
          ) {
            tmp = true
            node.style = { stroke: 'red' }
          }
        }
      }

      if (node.activitiType === 'SubProcess') {
        if (node.dealRules[0].dynamicReferenceChild) {
          if (_.isEmpty(node.dealRules[0].selectVariableVo)) {
            tmp = true
            node.style = { stroke: 'red' }
          }
        } else {
          if (
            !node.dealRules[0].childModel.id ||
            (+node.dealRules[0].isWriteback === 1 && !node.dealRules[0].writebackFieldVos)
          ) {
            tmp = true
            node.style = { stroke: 'red' }
          }
          // 单实例、非动态子流程、迁出路径未填
          if (node.dealRules[0].childMode === 1 && !node.dealRules[0].startFlow) {
            tmp = true
            node.style = { stroke: 'red' }
          }
          // 单实例时，检查是否选择了引用流程类型
          // 有些老数据初始不带subChartId
          if (node.dealRules[0].childMode === 1 && !node.dealRules[0].subChartId) {
            tmp = true
            node.style = { stroke: 'red' }
          }
        }
      }
      if (node.activitiType === 'TimingTask') {
        if (node.useVariable && !node.selectVariableVo.id) {
          tmp = true
          node.style = { stroke: 'red' }
        }
        if (
          node.timingStrategy.executionType === '0' &&
          !node.useVariable &&
          !node.timingStrategy.date
        ) {
          tmp = true
          node.style = { stroke: 'red' }
        }
        if (
          node.timingStrategy.executionType === '1' &&
          !node.useVariable &&
          !node.timingStrategy.timeInterval
        ) {
          tmp = true
          node.style = { stroke: 'red' }
        }
      }
      if (node.activitiType === 'RemoteRequest') {
        if (node.activityCrossVo) {
          if (
            _.isEmpty(node.activityCrossVo?.targetSystemId) ||
            _.isEmpty(node.activityCrossVo?.targetModel) ||
            node.activityCrossVo?.backfill === undefined ||
            node.activityCrossVo?.backfill === null
          ) {
            tmp = true
            node.style = { stroke: 'red' }
          }
        }
      }
      if (node.activitiType === 'ParallelGateway') {
        if (node.canDynamicSign && !node.variableCode) {
          tmp = true
          node.style = { stroke: 'red' }
        }
      }
      // 通知策略校验
      const nodeType = ['StartNoneEvent', 'EndNoneEvent', 'UserTask', 'AutoTask']
      if (
        nodeType.indexOf(node.activitiType) > -1 ||
        (node.activitiType === 'AutomaticDelivery' && node.autoExecutionType === '1')
      ) {
        _.map(node.notificationRules, (rule) => {
          if (rule.params.length < 1) {
            tmp1 = true
            node.style = { stroke: 'red' }
            return
          }
          _.map(rule.params, (param) => {
            if (_.isEmpty(param.executeParamPos)) {
              tmp1 = true
              node.style = { stroke: 'red' }
              return
            }
            _.map(param.executeParamPos, (executeParamPo) => {
              // type为6，7的时候不必填（6."第三方类的全路径名"，7."第三方jar包"）
              if ([6, 7].indexOf(executeParamPo.type) === -1) {
                if (
                  (_.isEmpty(executeParamPo.value) && _.isEmpty(executeParamPo.staffs)) ||
                  (param.type === 'configTicket' && !executeParamPo.code)
                ) {
                  tmp = true
                }
              }
            })
          })
        })
      }
    })
    this.flowStore.next(dataSource)
    // if (tmp2) {
    //   message.error(i18n('conf.model.proces.rule.tip2', '自动节点执行时间必填'))
    // }
    if (tmp || tmp1) {
      message.error(
        tmp
          ? i18n('conf.model.proces.chart', '请完善流程图信息')
          : i18n('conf.model.proces.notiRules', '请完善流程图通知策略信息')
      )
      return true
    }
    if (olaStrategyFlag) {
      message.error('请完善逾期策略信息')
      return true
    }
    if (olaStrategyOutGoingFlag) {
      message.error('逾期策略动作中审批工单的迁出路径不存在')
      return true
    }
    return false
  }

  changeModelStatus = () => {
    const { modelData } = this.props.basicInfoStore
    const { showStatusButton } = this.props.globalStore
    // 受不了这模型审核了
    // 系统不走模型审核时  已发布模型编辑完成后需要自动提交一遍审批
    // ********
    // 2021-9-8 R18.12.0 showStatusButton为false需要走审批
    if (!showStatusButton && !window.LOWCODE_APP_KEY) {
      const data = {
        type: 1,
        modelId: modelData.id,
        useable: 1,
        doAuthParamsVos: {
          name: '',
          sorts: 1,
          doAuthParamsVoList: [
            {
              id: '',
              modelId: modelData.id,
              authStatus: 1,
              comment: ''
            }
          ]
        },
        modelAuthParamVo: {
          id: modelData.id,
          modelName: modelData.name,
          type: '',
          layoutId: modelData.layoutInfoVo.id,
          layoutName: modelData.layoutInfoVo.name,
          applyType: 1,
          authStatus: 0,
          comment: '',
          reason: ''
        }
      }
      this.flowStore.changeModelStatus(data)
    }
  }

  render() {
    const { visibleKey } = this.props
    const { versionList, version, canForceUpdate } = this.flowStore
    const { chartId } = this.props.flowListStore
    const { loading } = this.state
    const { modelModify } = this.props.globalStore.configAuthor
    const { modelStatus } = this.props.basicInfoStore // 已发布模型禁止编辑
    const { showStatusButton } = this.props.globalStore
    const disabled = modelStatus !== -1 && !orLowcode(showStatusButton)
    const currentVersion = _.find(versionList, (item) => item.version === version) || {} // 当前版本的具体信息
    return (
      <div className="model-footer">
        <div>
          {visibleKey === '1' && orLowcode(modelModify) && (
            <Button
              disabled={disabled}
              type="primary"
              loading={loading || this.flowStore.isSubmiting}
              onClick={this.handleOk}
              style={{ marginRight: '16px' }}
            >
              {i18n('conf.model.save.basicInfo', '保存基本信息')}
            </Button>
          )}
          {chartId && orLowcode(modelModify) && (
            <React.Fragment>
              {
                // 设计中 ： 2    保存版本直接生效，无二次确认
                // 使用中 ： 0    不可发布， 可保存为新版本   可保存为当前版本（需要disconf开启）  需二次确认
                // 已发布 ： 1    不可发布， 可保存为新版本   需二次确认
                <Button.Group style={{ marginRight: 15 }}>
                  <Button
                    disabled={disabled}
                    type="primary"
                    onClick={() => {
                      this.saveFlow('save')
                    }}
                  >
                    {currentVersion.status === 2
                      ? i18n('model-flow-publish-force', '保存为当前版本')
                      : i18n('model-flow-save', '保存为新版本')}
                  </Button>
                  {
                    // 仅当 使用中 且 disconf开启覆盖发布  才展示
                    canForceUpdate && currentVersion.status === 1 && (
                      <Dropdown
                        placement="topRight"
                        overlay={
                          <Menu
                            onClick={() => {
                              this.saveFlow('publish', true)
                            }}
                          >
                            <Menu.Item>
                              {i18n('model-flow-publish-force2', '覆盖当前版本')}
                            </Menu.Item>
                          </Menu>
                        }
                      >
                        <Button
                          disabled={disabled}
                          style={{ paddingLeft: 0, paddingRight: 0 }}
                          type="primary"
                          icon={<DownOutlined />}
                        />
                      </Dropdown>
                    )
                  }
                </Button.Group>
              }
              <Button
                type="primary"
                disabled={currentVersion.status !== 2 || disabled}
                style={{ marginRight: 15 }}
                onClick={() => {
                  this.saveFlow('publish')
                }}
              >
                {i18n('model-flow-publish', '发布')}
              </Button>
              <Button
                disabled={versionList.length <= 1 || disabled}
                style={{ marginRight: 15 }}
                onClick={this.handleDelChart}
              >
                {i18n('delete', '删除')}
              </Button>
            </React.Fragment>
          )}
          <Button
            onClick={() => {
              let url = '/conf/model'
              if (window.LOWCODE_APP_KEY) {
                url = `/modellist/${window.LOWCODE_APP_KEY}/?activeTab=model`
              }
              linkTo({
                url: url,
                history: this.props.history,
                pageKey: 'model_list'
              })
            }}
          >
            {/* <LowcodeLink url="/conf/model" pageKey="home" homeKey="model_list"> */}
            {i18n('conf.model.foot.backModelList', '返回模型列表')}
            {/* </LowcodeLink> */}
          </Button>
          {chartId && (
            <Button
              style={{ marginLeft: 15 }}
              onClick={() => this.props.flowListStore.getChartInfo()}
            >
              {i18n('conf.model.foot.backflowList', '返回流程设计列表')}
            </Button>
          )}
        </div>
      </div>
    )
  }
}

export default Footer
