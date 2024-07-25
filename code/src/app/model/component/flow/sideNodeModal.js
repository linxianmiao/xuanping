import React, { Component } from 'react'
import { Drawer } from '@uyun/components'

import Line from './line'
import StartNode from './startNode'
import UserTask from './userTask'
import AutoTask from './autoTask'
import ParallelGateway from './parallelGateway'
import SubProcess from './subProcess'
import TimingTask from './timingTask'
import AutoPay from './autoPay'
import ExclusiveGateway from './exclusiveGateway'
import ApprovalTask from './approvalTask'
import InclusiveTask from './inclusiveTask'
import RemoteRequest from './remoteRequest'
import FlowStore from '../../store/flowStore'
import { Injectable, Inject } from '@uyun/everest-injectable'
import { getUserLength, checkHandlersRangeVo } from './utils'
@Injectable()
class SideNodeModal extends Component {
  @Inject(FlowStore) flowStore

  componentDidMount = () => {
    this.flowStore.getNodeList()
    this.flowStore.querySatageList(this.props.modelId)
  }

  // 为了解决校验状态之下填完数据不更新样式的问题
  componentWillReceiveProps(nextProps) {
    if (nextProps.item.id !== this.props.item.id) {
      const { item } = this.props
      let tmp = false
      const nodeType = ['StartNoneEvent', 'EndNoneEvent', 'UserTask']
      if (
        nodeType.indexOf(item.activitiType) > -1 ||
        (item.activitiType === 'AutomaticDelivery' && item.autoExecutionType === '1')
      ) {
        _.map(item.notificationRules, (rule) => {
          if (rule.params.length < 1) {
            tmp = true
            return
          }
          _.map(rule.params, (param) => {
            if (!param.executeParamPos || param.executeParamPos.length < 1) {
              tmp = true
              return
            }
            _.map(param.executeParamPos, (executeParamPo) => {
              if (
                _.isEmpty(executeParamPo.value) ||
                (param.type === 'configTicket' && !executeParamPo.code)
              ) {
                tmp = true
              }
            })
          })
        })
      }
      const activityCode = _.trim(item.activityCode)
      if (
        !item.attr &&
        (!item.text ||
          item.text.length > 50 ||
          !activityCode ||
          activityCode.length < 2 ||
          activityCode.length > 20)
      ) {
        tmp = true
      }
      switch (item.activitiType) {
        case 'StartNoneEvent':
          if (item.formId && !tmp) {
            this.flowStore.setAttr(item.id, 'style', {}, 'nodes')
          }
          break
        case 'EndNoneEvent':
          if (item.formId && !tmp) {
            this.flowStore.setAttr(item.id, 'style', {}, 'nodes')
          }
          break
        case 'UserTask':
          if (
            checkHandlersRangeVo(item.handlersRangeVo) ||
            !item.policy ||
            !item.formId ||
            (+item.needApproval === 1 && getUserLength(item.reviewers) < 1) ||
            (item.isSelectShielding && getUserLength(item.shieldingList) < 1)
          ) {
            tmp = true
          }
          if (!tmp) {
            this.flowStore.setAttr(item.id, 'style', {}, 'nodes')
          }
          break
        case 'AutomaticDelivery':
          if (
            item.autoExecutionType === '1' &&
            (checkHandlersRangeVo(item.handlersRangeVo) ||
              !item.policy ||
              !item.formId ||
              (+item.needApproval === 1 && getUserLength(item.reviewers) < 1) ||
              (item.isSelectShielding && getUserLength(item.shieldingList) < 1))
          ) {
            tmp = true
          }
          if (!item.sceneType) {
            tmp = true
          }
          if (!tmp) {
            this.flowStore.setAttr(item.id, 'style', {}, 'nodes')
          }
          break
        case 'AutoTask':
          if (
            !item.dealRules[0].autoCode &&
            !item.dealRules[0].autoId &&
            item.dealRules[0].autoType !== 2
          ) {
            tmp = true
          }
          _.map(item.dealRules[0].autoParams, (param) => {
            if (param.required && !param.value) {
              tmp = true
            }
          })
          if (!tmp) {
            this.flowStore.setAttr(item.id, 'style', {}, 'nodes')
          }
          break
        case 'SubProcess':
          if (item.dealRules[0].dynamicReferenceChild) {
            if (!_.isEmpty(item.dealRules[0].selectVariableVo)) {
              tmp = true
            }
          } else {
            if (
              !item.dealRules[0].childModel.id ||
              (item.dealRules[0].childModel.mode === 1 &&
                !item.dealRules[0].startFlow &&
                item.dealRules[0].autoCreateTicket === 0) ||
              (+item.dealRules[0].isWriteback === 1 && !item.dealRules[0].writebackFieldVos)
            ) {
              tmp = true
            }
          }
          if (!tmp) {
            this.flowStore.setAttr(item.id, 'style', {}, 'nodes')
          }
          break
        case 'ParallelGateway':
        case 'ExclusiveGateway':
          if (item.canDynamicSign && !item.variableCode) {
            tmp = true
          }
          if (!tmp) {
            this.flowStore.setAttr(item.id, 'style', {}, 'nodes')
          }
          break
        case 'TimingTask':
          if (item.useVariable && !item.selectVariableVo.id) {
            tmp = true
          }
          if (
            item.timingStrategy.executionType === '0' &&
            !item.useVariable &&
            !item.timingStrategy.date
          ) {
            tmp = true
          }
          if (
            item.timingStrategy.executionType === '1' &&
            !item.useVariable &&
            !item.timingStrategy.timeInterval
          ) {
            tmp = true
          }
          if (!tmp) {
            this.flowStore.setAttr(item.id, 'style', {}, 'nodes')
          }
          break
        default:
          return null
      }
      if (item.attr === 'line') {
        const flowCode = _.trim(item.flowCode)
        if (
          item.to.id &&
          item.from.id &&
          item.text &&
          item.text.length < 20 &&
          flowCode &&
          flowCode < 20 &&
          flowCode > 2
        ) {
          this.flowStore.setAttr(item.id, 'style', {}, 'links')
        }
      }
    }
  }

  render() {
    const { visible, item, changeVisbleKey, modelId } = this.props
    const { attr, activitiType } = item
    const { links, nodes } = this.flowStore.dataSource
    let ITEM = _.cloneDeep(item)
    if (
      !_.isEmpty(ITEM) &&
      !_.isEmpty(ITEM?.cooperateTenant) &&
      !_.isEmpty(ITEM?.cooperateTenant?.tenantId)
    ) {
      ITEM.isCheckedTenant = true
    }
    return (
      <Drawer
        title={attr === 'line' ? i18n('link_attr', '连线属性') : i18n('node_attr', '节点属性')}
        className="model-node-drawer"
        contentWrapperStyle={{ width: 500 }}
        visible={visible}
        size="small"
        outerClose={false}
        destroyOnClose
        onClose={this.props.onCancel}
      >
        {attr === 'line' && <Line item={item} />}
        {(activitiType === 'StartNoneEvent' || activitiType === 'EndNoneEvent') && (
          <StartNode item={item} changeVisbleKey={changeVisbleKey} />
        )}
        {/* 人工节点 */}
        {activitiType === 'UserTask' && (
          <UserTask
            item={ITEM}
            changeVisbleKey={changeVisbleKey}
            changeWidth={this.props.changeWidth}
          />
        )}
        {/* 人工节点 */}
        {activitiType === 'AutoTask' && (
          <AutoTask
            item={item}
            changeVisbleKey={changeVisbleKey}
            changeWidth={this.props.changeWidth}
            modelId={modelId}
          />
        )}
        {activitiType === 'ExclusiveGateway' && <ExclusiveGateway item={item} />}
        {activitiType === 'ParallelGateway' && <ParallelGateway item={item} />}
        {/* 子流程 */}
        {activitiType === 'SubProcess' && (
          <SubProcess
            item={item}
            changeWidth={this.props.changeWidth}
            links={links}
            nodes={nodes}
          />
        )}
        {activitiType === 'TimingTask' && (
          <TimingTask item={item} changeWidth={this.props.changeWidth} />
        )}
        {activitiType === 'AutomaticDelivery' && (
          <AutoPay
            changeVisbleKey={changeVisbleKey}
            item={item}
            changeWidth={this.props.changeWidth}
            res={this.props.res}
          />
        )}
        {/* 审批节点 */}
        {activitiType === 'ApprovalTask' && (
          <ApprovalTask
            changeVisbleKey={changeVisbleKey}
            item={ITEM}
            changeWidth={this.props.changeWidth}
          />
        )}
        {/* 包容节点 */}
        {activitiType === 'InclusiveGateway' && (
          <InclusiveTask
            changeVisbleKey={changeVisbleKey}
            item={item}
            changeWidth={this.props.changeWidth}
          />
        )}
        {activitiType === 'RemoteRequest' && (
          <RemoteRequest
            item={item}
            changeVisbleKey={changeVisbleKey}
            changeWidth={this.props.changeWidth}
            links={links}
            nodes={nodes}
          />
        )}
      </Drawer>
    )
  }
}

export default SideNodeModal
