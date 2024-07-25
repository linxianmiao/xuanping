import React, { Component } from 'react'
import { DownOutlined } from '@uyun/icons'
import { Button, Dropdown, Menu, Modal, message } from '@uyun/components'
import AcceptBtn from './btns/AcceptBtn'
import AgreeBtn from './btns/AgreeBtn'
import RejectBtn from './btns/RejectBtn'
import ReassignmentBtn from './btns/ReassignmentBtn'
import CrossUnitReassignmentBtn from './btns/CrossUnitReassignmentBtn'
import SuspendBtn from './btns/SuspendBtn'
import AddMultiPerformerBtn from './btns/AddMultiPerformerBtn'
import ReminderBtn from './btns/ReminderBtn'
import RollbackBtn from './btns/RollbackBtn'
import CloseBtn from './btns/CloseBtn'
import AbolishBtn from './btns/AbolishBtn'
import AddSignBtn from './btns/AddSignBtn'
import RevokeBtn from './btns/RevokeBtn'
import RemoteTicketBtn from './btns/RemoteTicketBtn'
import UpdateDataBtn from './btns/UpdateDataBtn'
import SaveDraftBtn from './btns/SaveDraftBtn'
import ReviewedBtn from './btns/ReviewedBtn'
import CcBtn from './btns/CcBtn'
import CoOrganizerBtn from './btns/CoOrganizerBtn'
import LinkBtn from './btns/LinkBtn'
import RemoteRollBackBtn from './btns/RemoteRollBackBtn'
import RetrieveRemoteTicketBtn from './btns/RetrieveRemoteTicketBtn'
import { getOperationButtonPosition, getBtnConfigProperty } from './logic'

const linkType = ['agree', 'reject', 'activity_flow_button']
class EditBtn extends Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
    this.state = {
      disabledAssistFinishBtn: false
    }
  }

  componentDidMount() {
    console.log(this.ref, this.ref.current)
  }

  // 线的提交按钮 逻辑
  linkBtnLogic = (info) => {
    const { type, jumpTache, childModel, dynamicReferenceChild } = info
    const { formList, ticketJumpShow, ticketSubModelShow, showModal } = this.props
    const { isCountersign, currentExecutorName } = formList
    if (type === 1 && jumpTache) {
      // 跳转
      ticketJumpShow(info)
    } else if (type === 2 && isCountersign === 1 && currentExecutorName.length > 1) {
      // 级模型会签依次会签接子流程手动建单时，走跳转
      ticketJumpShow(info, 2)
    } else if (type === 2 && (childModel || dynamicReferenceChild === 1)) {
      // 如果是发起子流程 或 动态子流程
      ticketSubModelShow(info)
    } else if (type === 3) {
      showModal('complete')
    }
  }

  // 回退按钮的逻辑
  rollbackBtnLogic = (info) => {
    const { rollbackWay, tacheId } = info
    const { handleFixedPointBack, handleRollBack } = this.props
    if (rollbackWay === 1) {
      // 自由回退
      handleRollBack({ key: tacheId })
    } else if (rollbackWay === 2) {
      // 定点回退
      handleFixedPointBack()
    } else {
      handleRollBack()
    }
  }

  // 点击不同类型的按钮
  onClickBtn = (btnType, info, btnInfo) => {
    const {
      ticketReceive,
      showModal,
      showMultiPerformer,
      showReminder,
      ticketEndorsement,
      ticketUpdate,
      ticketSave,
      handleReview,
      showCc,
      getBtnInfo,
      coOperation
    } = this.props
    const { createRelateTicket } = coOperation
    const btnConfigProperty = getBtnConfigProperty(btnInfo)
    getBtnInfo(btnConfigProperty)
    switch (btnType) {
      // 接单
      case 'accept':
        ticketReceive(1)
        break
      // 同意 (按提交线逻辑)
      case 'agree':
        // 处理线按钮逻辑
        this.linkBtnLogic(_.assign({}, info, { btnType }))
        break
      // 驳回 (按提交线的逻辑)
      case 'reject':
        // 处理线按钮逻辑
        this.linkBtnLogic(_.assign({}, info, { btnType }))
        break
      // 改派
      case 'reassignment':
        showModal('reassign')
        break
      // 跨单位改派
      case 'cross_unit_reassignment':
        showModal('crossUnitReassign')
        break
      // 挂起
      case 'suspend':
        showModal('suspend')
        break
      // 挂起 -> 恢复
      case 'recovery':
        showModal('recovery')
        break
      // 增加会签人
      case 'add_multi_performer':
        showMultiPerformer()
        break
      // 催办
      case 'reminder':
        showReminder(btnConfigProperty)
        break
      // 回退
      case 'rollback':
        this.rollbackBtnLogic(info)
        break
      // 关闭
      case 'close':
        showModal('close')
        break
      // 关闭 -> 重开
      case 'reopen':
        showModal('reopen')
        break
      // 废除
      case 'abolish':
        showModal('abolish')
        break
      // 废除 ->还原
      case 'restore':
        showModal('restore')
        break
      // 加签
      case 'addSign':
        ticketEndorsement()
        break
      // 取回
      case 'revoke':
        showModal('retrieve')
        break
      // 远程工单
      case 'remote_ticket':
        showModal('remoteTicket')
        break
      case 'remote_roll_back':
        showModal('remote_roll_back')
        break
      // 更新数据
      case 'updateData':
        ticketUpdate()
        break
      // 保存草稿
      case 'saveDraft':
        ticketSave()
        break
      // 审阅
      case 'reviewed':
        handleReview()
        break
      // 抄送
      case 'cc':
        showCc()
        break
      case 'CoOrganizer':
        createRelateTicket()
        break
      case 'auto_approval':
        break
      // 线按钮的类型
      case 'activity_flow_button':
        // 处理线按钮逻辑
        this.linkBtnLogic(info)
        break
      case 'assistFinish':
        this.hideCreateAssistTicketBtn()
        break
      case 'retrieveRemoteTicket':
        showModal('retrieveRemoteTicket')
        break
      default:
        return null
    }
  }

  hideCreateAssistTicketBtn = () => {
    const { finishCoOrganizer } = this.props
    Modal.confirm({
      title: i18n('globe.confirm', '确认提示'),
      content: i18n('ticket.from.hideAssitTicket', '确认协办完成吗'),
      onOk: async () => {
        finishCoOrganizer && (await finishCoOrganizer())
        this.setState({ disabledAssistFinishBtn: true })
      }
    })
  }

  // 遍历不同类型的按钮
  switchBtnType = (record) => {
    const { type } = record
    const { formList, restrictBtns } = this.props
    const btnProps = {
      ...this.props,
      btnInfo: record,
      onClickBtn: (btnType, info) => this.onClickBtn(btnType, info, record)
    }

    const { disabledAssistFinishBtn } = this.state
    // 按钮类型(注意：这里的类型都是在模型中配置的)
    switch (type) {
      // 接单
      case 'accept':
        return AcceptBtn({ btnProps })
      // 同意 (按提交线逻辑)
      case 'agree':
        return AgreeBtn({ btnProps })
      // 驳回 (按提交线的逻辑)
      case 'reject':
        return RejectBtn({ btnProps })
      // 改派
      case 'reassignment':
        return ReassignmentBtn({ btnProps })
      // 跨单位改派
      case 'cross_unit_reassignment':
        return CrossUnitReassignmentBtn({ btnProps })
      // 挂起和恢复
      case 'suspend':
        return SuspendBtn({ btnProps })
      // 增加会签人
      case 'add_multi_performer':
        return AddMultiPerformerBtn({ btnProps })
      // 催办
      case 'reminder':
        return ReminderBtn({ btnProps })
      // 回退
      case 'rollback':
        return RollbackBtn({ btnProps })
      // 关闭和重开
      case 'close':
        return CloseBtn({ btnProps })
      // 废除和还原
      case 'abolish':
        return AbolishBtn({ btnProps })
      // 加签
      case 'addSign':
        return AddSignBtn({ btnProps })
      // 取回
      case 'revoke':
        return RevokeBtn({ btnProps })
      // 远程工单
      case 'remote_ticket':
        return RemoteTicketBtn({ btnProps })
      // 更新数据
      case 'updateData':
        return UpdateDataBtn({ btnProps })
      // 保存草稿
      case 'saveDraft':
        return SaveDraftBtn({ btnProps })
      // 审阅
      case 'reviewed':
        return ReviewedBtn({ btnProps })
      // 抄送
      case 'cc':
        return CcBtn({ btnProps })
      // 自动审批: 这个按钮不会在详情按钮里显示的，只有启用和不启用的操作，逻辑都在服务端 ; (只是为了兼容老数据，其实不应该放在按钮组件里配置)
      case 'auto_approval':
        return null
      // 线按钮的类型
      case 'activity_flow_button':
        // 处理线按钮
        if (record.activityFlowId) {
          return LinkBtn({ btnProps, restrictBtns })
        }
        return null
      case 'assistFinish':
        if (formList.canFinishCoOrganizer) {
          return (
            <Menu.Item key={type} type={type} btn_info={record} disabled={disabledAssistFinishBtn}>
              {record.label}
            </Menu.Item>
          )
        }
        return null
      case 'remote_roll_back':
        return RemoteRollBackBtn({ btnProps })
      case 'CoOrganizer':
        return CoOrganizerBtn({ btnProps })
      case 'retrieveRemoteTicket':
        return RetrieveRemoteTicketBtn({ btnProps })
      default:
        return null
    }
  }

  renderMenu = (menuItems) => {
    return (
      <Menu
        onClick={({ item }) => {
          const btnType = item.props.type
          const btnInfo = item.props.btn_info || {}
          let info = {}
          // 如果存在二级下拉 暂未发现存在二级下拉情况，如果有，这里需要改动，组件升级到V5后这里props里没有parentMenu这个属性了
          // if (item.props.parentMenu.props.type) {
          //   btnType = item.props.parentMenu.props.type
          // }
          // 线按钮
          if (linkType.includes(btnType)) {
            info = item.props.rule_info || {}
          }
          // 如果是回退
          if (btnType === 'rollback') {
            info = item.props.rollbackInfo
          }
          this.onClickBtn(btnType, info, btnInfo)
        }}
      >
        {menuItems}
      </Menu>
    )
  }

  render() {
    const { loading, formList, modelRule, handleLoadRollBack, ticketSource } = this.props
    const { tacheButton, activityType } = formList
    // 获取 便捷操作 和 更多操作
    let { operationAgile, operationMore } = getOperationButtonPosition({
      list: _.cloneDeep(tacheButton),
      modelRule,
      activityType,
      formList
    })
    if (ticketSource === 'portal') {
      operationAgile = _.filter(operationAgile, (d) => d.type !== 'saveDraft')
      operationMore = _.filter(operationMore, (d) => d.type !== 'saveDraft')
    }

    const menuItems = operationMore.length
      ? operationMore.map((item) => {
          return this.switchBtnType({ ...item })
        })
      : []
    // 是否显示更多按钮
    const isOperationMore = menuItems.every((item) => !item)
    return (
      <>
        {/* 便捷操作 */}
        {operationAgile.map((item) => {
          return this.switchBtnType({ ...item })
        })}
        {/* 更多操作 */}
        {!isOperationMore ? (
          <Dropdown
            disabled={!!loading}
            overlay={this.renderMenu(menuItems)}
            trigger={['hover']}
            onVisibleChange={(visible) => {
              // 如果更多中有 回退操作，且是自由回退时，需获取回退节点
              if (
                visible &&
                operationMore.some((item) => item.type === 'rollback' && item.rollbackWay === 1)
              ) {
                handleLoadRollBack(visible)
              }
            }}
          >
            <Button>
              {i18n('globe.more', '更多')}
              <DownOutlined />
            </Button>
          </Dropdown>
        ) : null}
      </>
    )
  }
}

export default EditBtn
