import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { Button, Menu, Dropdown, message, Tooltip, Modal } from '@uyun/components'
import { getPerUrl } from '~/components/common/getPerUrl'
import TicketSubmit from './operate/submit'
import TicketSubmodel from './operate/submodel'
import TicketReassign from './operate/reassign'
import TicketJump from './operate/jump'
import SeniorJump from './operate/seniorJump' // 高级流程的跳转
import TicketRollBack from './operate/rollBack'
import CreateSubmodel from './operate/createSubmodel'
import CarbonCopyModal from './operate/CarbonCopy'
import EndorsementModal from './operate/endorsement'
import CrossUnitReassignModal from './operate/CrossUnitReassignModal'
import RemoteTicketModal from './operate/RemoteTicketModal'
import ViewRemoteRecordsButton from './operate/ViewRemoteRecordsButton'
import MultiPerformerModal from './operate/MultiPerformer'
import iframeResource from './iframeResource'
import RelateTicket from '~/ticket/relateTicket'
import './styles/lookBtn.less'
import { qs } from '@uyun/utils'
import EditBtn from './editBtn'
import { getLinkBtnInfo } from './logic'

const MenuItem = Menu.Item

@inject('ticketStore', 'globalStore')
@iframeResource
@withRouter
@observer
class LookBtn extends Component {
  constructor(props) {
    super(props)
    this.flowusers = {} // 流程中选择的人员
    this.state = {
      loading: '',
      visible: '',
      btnVisible: false, // 接单模态框
      isSuccess: false, // 操作成功判断
      isReceiveTicket: this.props.isReceiveTicket || 0, // 是否可接单判断
      modelRule: {}, // 模型规则
      menuItem: [], // 合并显示下拉菜单项
      menuItemList: [], // 合并显示下拉菜单组件
      subModel: {}, // 发起子流程时对应子流程对象
      currentJump: {}, // 发起跳转时对应跳转环节信息
      ticketFinishVisible: false, // 控制完成模态框
      btnload: false,
      submodelVisible: false,
      submodelItem: {},
      formsData: {}, // 手动建单是需要带过去主流程的表单数据或者提交的时候表单数据
      nextActivity: [],
      rollBackList: [], // 自由回退时，可回退列表
      rollBackId: null,
      multiPerformerLoading: false,
      btnInfo: {}, // 存当前按钮的配置（处理意见，重命名等）
      onlyMessage: false, // 弹窗中只显示处理意见
      hideCreateCoOrganizer: false, // 隐藏--新建协办单--按钮
      coOrganizerVisible: false
    }
  }

  setFlowUser = (item, type, initialValue, compareValue) => {
    // item.code 存在的时候是并行组
    let flowusers = null
    if (item.type === 'parallel') {
      // 并行组的时候
      if (type === 'user') {
        flowusers = _.merge({}, this.flowusers, {
          parallelismTacheUser: { [item.code]: initialValue }
        })
        flowusers.parallelismTacheUser[item.code] = initialValue
      } else if (type === 'userGroup') {
        flowusers = _.merge({}, this.flowusers, {
          parallelismTacheGroup: { [item.code]: initialValue }
        })
        flowusers.parallelismTacheGroup[item.code] = initialValue
      }
    } else if (item.type === 'normal') {
      // 一般状态下
      if (type === 'user') {
        flowusers = _.merge({}, this.flowusers, { userList: initialValue })
        flowusers.userList = initialValue
      } else if (type === 'userGroup') {
        flowusers = _.merge({}, this.flowusers, { groupList: initialValue })
        flowusers.groupList = initialValue
      }
    } else if (item.type === 'create') {
      // 创建状态下
      if (type === 'user') {
        flowusers = _.merge({}, this.flowusers, {
          executorAndGroup: { [item.code]: { user: initialValue } }
        })
        flowusers.executorAndGroup[item.code].user = initialValue
      } else if (type === 'userGroup') {
        flowusers = _.merge({}, this.flowusers, {
          executorAndGroup: { [item.code]: { group: initialValue } }
        })
        flowusers.executorAndGroup[item.code].group = initialValue
      }
    } else if (item.type === 'reassign') {
      // 改派状态下
      if (type === 'user') {
        flowusers = _.merge({}, this.flowusers, { currexcutor: initialValue.join(',') })
        if (Array.isArray(compareValue) && compareValue.length === 0) {
          flowusers.currGroup = undefined
        }
      } else if (type === 'userGroup') {
        flowusers = _.merge({}, this.flowusers, { currGroup: initialValue.join(',') })
        if (Array.isArray(compareValue) && compareValue.length === 0) {
          flowusers.currexcutor = undefined
        }
      }
      flowusers.changeType = type === 'user' ? 1 : 0
    } else if (item.type === 'submodal') {
      if (type === 'user') {
        flowusers = _.merge({}, this.flowusers, {
          subExecutorAndGroup: { [item.code]: { user: initialValue } }
        })
        flowusers.subExecutorAndGroup[item.code].user = initialValue
      } else if (type === 'userGroup') {
        flowusers = _.merge({}, this.flowusers, {
          subExecutorAndGroup: { [item.code]: { group: initialValue } }
        })
        flowusers.subExecutorAndGroup[item.code].group = initialValue
      }
    } else if (item.type === 'forward') {
      if (type === 'user') {
        // 前序环节
        flowusers = _.merge({}, this.flowusers, {
          executorsAndGroupIds: { [item.code]: { user: initialValue } }
        })
        flowusers.executorsAndGroupIds[item.code].user = initialValue
      } else if (type === 'userGroup') {
        flowusers = _.merge({}, this.flowusers, {
          executorsAndGroupIds: { [item.code]: { group: initialValue } }
        })
        flowusers.executorsAndGroupIds[item.code].group = initialValue
      }
    }
    this.flowusers = _.cloneDeep(flowusers)
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.formList.tacheId !== nextProps.formList.tacheId ||
      this.props.formList.ticketId !== nextProps.formList.ticketId ||
      this.props.formList.caseId !== nextProps.formList.caseId
    ) {
      this.getButtonList(nextProps)
      this.setState({
        // 重置子流程策划框状态  加签弹窗
        submodelVisible: false,
        visible: ''
      })
    }
  }

  componentDidMount() {
    this.props.ticketStore.resetRestrictBtns()
    this.getButtonList(this.props)
  }

  getmenuItemList = (data) => {
    const menuItemListTemp = []
    _.map(data.ruleVos, (item) => {
      if (item.ruleType === 0) {
        // ruleType 规则类型-合并显示
        if (item.type === 1) {
          // type为1 跳转环节
          menuItemListTemp.push({
            flag: 'jump',
            id: item.jumpTache.tacheId,
            name: item.name,
            users: item.jumpTache.users,
            groups: item.jumpTache.groups,
            isCountersign: item.jumpTache.isCountersign,
            policy: item.jumpTache.policy,
            ruleType: item.ruleType,
            tacheType: item.jumpTache.tacheType,
            parallelismTaches: item.jumpTache.parallelismTaches,
            activityFlowId: item.activityFlowId // 高级流程线id
          })
        } else if (item.type === 2) {
          // type为2， 发起子流程
          menuItemListTemp.push({
            flag: 'sub',
            id: item.childModel.id,
            name: item.name,
            item: item,
            needSuspend: item.childModel.needSuspend,
            ruleType: item.ruleType,
            dealRuleId: item.id
          })
        } else if (item.type === 3) {
          menuItemListTemp.push({
            flag: 'finish',
            id: item.id,
            name: item.name,
            item: item,
            ruleType: item.ruleType
          })
        }
      }
    })
    return menuItemListTemp
  }

  getButtonList = (props) => {
    const cb = (data) => {
      this.props.ticketStore.getCurrentActivity(data) // 关联工单要用这个数据
      const menuItemListTemp = this.getmenuItemList(data)
      this.setState({
        modelRule: data,
        buttonList: [],
        menuItemList: menuItemListTemp
      })
    }
    this.props.getActivityById(
      {
        status: 1,
        id: props.formList.ticketId,
        tacheId: props.formList.tacheId,
        tacheType: props.formList.tacheType,
        caseId: props.formList.caseId
      },
      cb
    )
  }

  // 处理提交得处理意见
  manageData = (data) => {
    function parseDom(arg) {
      const objE = document.createElement('div')
      objE.innerHTML = arg
      return objE.childNodes
    }
    const toUserList = []
    if (!data.message) {
      data.message = ''
    }
    const matchADom = data.message.match(/<a user_id="([a-fA-F0-9]{32})" >(.*?)<\/a>/gi)
    _.map(matchADom, (dom) => {
      const aDom = parseDom(dom)
      const name = aDom[0].innerHTML
      data.message = data.message.replace(dom, name)
      toUserList.push(aDom[0].getAttribute('user_id'))
    })
    data.message = data.message.replace(/\n/g, '<br/>')
    return {
      toUserList,
      content: data.message || ''
    }
  }

  // 展示弹框
  showModal = (visible) => {
    this.props.validate(
      (formsData) => {
        if (
          _.includes(
            [
              'rollBack',
              'abolish',
              'restore',
              'close',
              'reopen',
              'complete',
              'suspend',
              'recovery',
              'retrieve',
              'confirmNotPass',
              'ticket_roll_back',
              'remote_submit',
              'retrieveRemoteTicket'
            ],
            visible
          )
        ) {
          if (
            this.state.btnInfo.messageStatus === 2 &&
            this.state.btnInfo.rollbackResumeType !== 2
          ) {
            this.setState({ loading: visible })
            switch (visible) {
              case 'rollBack':
                this.ticketRollBack()
                break
              case 'abolish':
                this.ticketDelete()
                break // 废除
              case 'restore':
                this.ticketReopen()
                break // 还原
              case 'close':
                this.ticketClose()
                break // 关闭
              case 'reopen':
                this.ticketReopen()
                break // 重开
              case 'complete':
                this.ticketFinish()
                break
              case 'suspend':
                this.ticketSuspend()
                break // 挂起
              case 'recovery':
                this.ticketResume()
                break // 恢复
              case 'retrieve':
                this.ticketRetrieve()
                break // 取回
              case 'retrieveRemoteTicket':
                this.clickRetrieveRemoteTicketBtn()
                break
              default:
                break
            }
          } else {
            this.setState({ visible, formsData, loading: visible })
          }
        } else {
          if (['submit'].indexOf(visible) !== -1) {
            this.props.validate(() => {
              this.setState({ visible, formsData, loading: visible })
            })
          } else {
            this.setState({ visible, formsData, loading: visible })
          }
        }
      },
      { action: visible }
    )
  }

  clickRetrieveRemoteTicketBtn = async () => {
    let values = {}
    if (this.retrieveRemoteTicket) {
      values = await this.retrieveRemoteTicket.validate()
    }
    this.props.handleOk({ content: values.message }, 'retrieveRemoteTicket').then((result) => {
      this.hideModal()
    })
  }

  submitbtnforbidden = () => {
    this.setState({
      btnload: true
    })
  }

  // 隐藏弹框
  hideModal = () => {
    this.setState({
      visible: '',
      btnload: false,
      loading: ''
    })
  }

  // 获取提交工单的数据
  getSubmitData = (values) => {
    return _.assign(
      {},
      {
        tacheType: this.props.formList.tacheType,
        tacheNo: this.props.formList.tacheNo,
        tacheId: this.props.formList.tacheId,
        ticketId: this.props.formList.ticketId,
        modelId: this.props.formList.modelId,
        message: this.manageData(values) // 提交时对处理意见的信息处理
      },
      this.flowusers
    )
  }

  /* --------------------------接单开始----------------------------- */
  ticketReceive = (type) => {
    // type 0 自动接单 1 手动接单
    const receive = () => {
      this.setState({ btnVisible: true })
      this.props.handleOk({}, 'receive').then((result) => {
        if (result === 'receive') {
          message.success(i18n('ticket.detail.success', '成功接单'))
          this.props.changeReceiveTicket && this.props.changeReceiveTicket(0)
          //! 避免了一次刷新，但是如果配置了接单触发通知策略的时候，会出现bug，产品背锅
          this.props.getAgainDetailForms && this.props.getAgainDetailForms()
          // 接单后刷新ola列表
          this.props.ticketStore.getOLAList(this.props.formList.ticketId)
        }
        this.setState({
          btnVisible: false
        })
      })
    }
    if (type) {
      Modal.confirm({
        title: i18n('ticket.detail.receive.modal.tip', '接单后您将正式开始处理工单，请确认？'),
        onOk: receive
      })
    } else {
      receive()
    }
  }
  /* ---------------------------接单结束----------------------------- */

  /* -------------------------提交工单开始---------------------------- */
  ticketSubmit = () => {
    // 处理意见过长不允许提交
    this.submit.props.form.validateFields((errors, values) => {
      if (errors) return false
      this.submitbtnforbidden()
      const data = this.getSubmitData(values)
      // 提交的时候如果是敏捷模型的话，需要删除tacheId
      if (+this.props.formList.modelType === 0) {
        delete data.tacheId
      }
      this.props.handleOk(data, 'submit', this.hideModal).then((result) => {
        this.hideModal()
      })
    })
  }
  /* -------------------------提交工单结束------------------------------- */

  /* ----------------------创建子工单工单开始---------------------------- */
  // 独立显示的子流程按钮 点击事件
  ticketSubModelShow = (item, submodelData = {}, type, realNodes = []) => {
    const validateAction = {
      action: 'submodel',
      flowCode: item.flowCode
    }
    // 手动建单 autoCreateTicket === 1 ； 自动建单 autoCreateTicket === 0
    if (!_.includes(['submodelJumpEnd', 'submodelEnd'], type) && item.autoCreateTicket === 1) {
      this.props.validate((values) => {
        this.handleSubmodel(true, item, values)
      }, validateAction)
      return false
    }
    this.props.validate((values) => {
      // 设置传入模态框的值
      const subModel = {
        item,
        id: item.childModel ? item.childModel.id : null,
        name: item.name,
        needSuspend: item.childModel ? item.childModel.needSuspend : null,
        ruleType: item.ruleType,
        dealRuleId: item.id,
        autoCreateTicket: item.autoCreateTicket,
        submodelData: submodelData,
        jumpActivity: submodelData.jumpActivity,
        submodelType: type,
        childMode: item.childMode,
        activitys: realNodes || []
      }
      if (this.state.btnInfo.messageStatus === 2) {
        const tacheVoList = subModel.item.childModel.tacheVoList
        const falt = _.every(tacheVoList, (item) => {
          if (!_.isEmpty(item.parallelismTaches)) {
            return _.every(item.parallelismTaches, (paralle) => paralle.policy !== 2)
          } else {
            return item.policy !== 2
          }
        })
        let falt1
        if (submodelData.jumpActivity.tacheType === 0) {
          falt1 = submodelData.jumpActivity.policy !== 1
          if (submodelData.jumpActivity.policy === 5) {
            falt1 = false
          }
        } else if (submodelData.jumpActivity.tacheType === 1) {
          falt1 = _.every(
            submodelData.jumpActivity.parallelismTaches,
            (paralle) => paralle.policy !== 1
          )
        }
        let falt2 = true
        if (this.state.modelRule.modelType === 0) {
          const needSuspend = this.state.subModel ? this.state.subModel.needSuspend : 0
          const { nextActivity } = this.state
          if (
            needSuspend !== 0 &&
            needSuspend !== 3 &&
            (nextActivity.length > 1 || nextActivity[0].tacheType === 2)
          ) {
            falt2 = false
          }
        }
        if (falt && falt1 && falt2) {
          this.setState({ subModel: subModel, loading: 'submodel' }, () => {
            this.ticketSubmodel()
          })
        } else {
          if (realNodes && realNodes.length === 0) {
            this.setState({ subModel: subModel, loading: 'submodel' }, () => {
              this.ticketSubmodel()
            })
          } else {
            this.setState({ visible: 'submodel', subModel: subModel, formsData: values })
          }
        }
      } else {
        if (realNodes && realNodes.length === 0) {
          if (this.state.btnInfo.messageStatus === 2) {
            this.setState({ subModel: subModel, loading: 'submodel' }, () => {
              this.ticketSubmodel()
            })
          } else {
            this.setState({
              visible: 'submodel',
              subModel: subModel,
              formsData: values,
              onlyMessage: true
            })
          }
        } else {
          this.setState({ visible: 'submodel', subModel: subModel, formsData: values })
        }
      }
    }, validateAction)
  }

  // 手动创建子流程
  handleSubmodel = (visible, item = {}, formsData = {}) => {
    this.setState({
      submodelVisible: visible,
      submodelItem: item,
      formsData: formsData
    })
  }

  ticketSubmodel = async () => {
    const _this = this
    let values = {}
    if (this.submodel) {
      values = await this.submodel.validate()
    }
    const currentSubModel = _this.state.subModel
    this.submitbtnforbidden()
    const data = {
      message: this.manageData(values),
      ticketId: this.props.formList.ticketId,
      needSuspend: currentSubModel.needSuspend,
      subModelId: currentSubModel.id,
      filterRule: !_.isEmpty(_this.state.subModel)
        ? _this.state.subModel.item.childModel
          ? _this.state.subModel.item.childModel.filterRule
          : null
        : null,
      dealRuleId: currentSubModel.dealRuleId,
      tacheId: this.props.formList.tacheId,
      tacheType: this.props.formList.tacheType,
      tacheNo: this.props.formList.tacheNo,
      modelId: this.props.formList.modelId,
      autoCreateTicket: currentSubModel.autoCreateTicket,
      flowId: currentSubModel.item.activityFlowId,
      flowCode: currentSubModel.item.flowCode,
      childMode: currentSubModel.childMode
    }

    if (currentSubModel.submodelData.jumpActivity) {
      data.subTicketFlowId = currentSubModel.submodelData.jumpActivity.activityFlowId
    } else if (currentSubModel.item.startFlow) {
      data.subTicketFlowId = currentSubModel.item.startFlow
    }

    let type = 'submodel'
    if (currentSubModel.autoCreateTicket === 1) {
      data.subForm = currentSubModel.submodelData.formsData
      data.subTicketId = currentSubModel.submodelData.subTicketId
      type = 'hideSubmodel'
    }

    if (currentSubModel.submodelType === 'submodelJumpEnd') {
      this.flowusers.subTicketTacheId = currentSubModel.jumpActivity.id
    }
    const submodelData = _.assign({}, data, this.flowusers)
    this.props.handleOk(submodelData, type).then((result) => {
      this.hideModal()
    })
  }
  /* -------------------------创建子工单工单结束----------------------------------- */

  /* ----------------------------改派工单开始-------------------------------------- */

  ticketReassign = () => {
    this.reassign.props.form.validateFields((errors, values) => {
      if (errors) return false
      const data = this.getSubmitData(values)
      this.submitbtnforbidden()
      data.counterSignTaskUserId = values.counterSignTaskUserId
      this.props.handleOk(data, 'reassign').then((result) => {
        this.hideModal()
      })
    })
  }
  /* -------------------------------改派工单结束------------------------------------------ */

  /* -------------------------------跨租户改派工单开始------------------------------------------ */
  ticketCrossUnitReassign = (values) => {
    this.submitbtnforbidden()

    const { ticketId, caseId, tacheId } = this.props.formList
    const data = {
      ticketId,
      caseId,
      activityId: tacheId,
      staffVoList: values.users.map((item) => ({
        id: item.id,
        tenantId: item.tenantId,
        type: item.type === 7 || item.type === 1 ? 1 : 0 // 跨租户用户1 用户组0
      })),
      message: this.manageData(values)
    }
    this.props.handleOk(data, 'crossUnitReassign').then(() => {
      this.hideModal()
    })
  }
  /* -------------------------------跨租户改派工单结束------------------------------------------ */

  /* -------------------------------远程工单开始------------------------------------------ */
  remoteTicket = (values) => {
    this.submitbtnforbidden()

    const { ticketId, modelId } = this.props.formList
    const data = {
      currentTicketId: ticketId,
      currentModelId: modelId,
      targetNodeId: values.targetNodeId,
      message: this.manageData(values)
    }
    this.props.handleOk(data, 'remoteTicket').then(() => {
      this.hideModal()
    })
  }
  /* -------------------------------远程工单结束------------------------------------------ */

  /* -------------------------------跨租户提交工单开始------------------------------------------ */
  ticketCrossUnitSubmit = () => {
    this.crossUnitSubmit.props.form.validateFields((errors, values) => {
      if (errors) return false
      const { ticketId, caseId, tacheId } = this.props.formList
      const data = {
        ticketId,
        caseId,
        activityId: tacheId,
        message: this.manageData(values)
      }
      this.props.handleOk(data, 'crossUnitSubmit').then(() => {
        this.hideModal()
      })
    })
  }
  /* -------------------------------跨租户提交工单结束------------------------------------------ */

  /* -------------------------------回退工单开始------------------------------------------ */
  ticketRollBack = async () => {
    const { tacheId, rollbackWay, rollbackResumeType } = this.props.formList
    let values = {}
    if (this.rollback) {
      values = await this.rollback.validate()
    }
    this.submitbtnforbidden()
    const data = this.getSubmitData(values)
    data.targetActivityId = this.state.rollBackId
    data.tacheId = tacheId
    data.rollbackWay = rollbackWay

    // 回退后的提交方式，用来判断快速回退还是普通回退
    // 2表示用户自己选择提交方式，取values中的rollbackResumeType
    if (rollbackResumeType === 2) {
      data.rollbackResumeType = values.rollbackResumeType
    } else {
      data.rollbackResumeType = rollbackResumeType
    }

    this.props.handleOk(data, 'rollBack').then((result) => {
      this.hideModal()
    })
  }

  ticketRemoteRollBack = async () => {
    const { btnInfo } = this.state
    const { ticketId, caseId, version, tacheId } = this.props.formList

    let values = {}
    if (this.rollback) {
      values = await this.rollback.validate()
    }
    this.submitbtnforbidden()
    const data = {
      rollbackWay: btnInfo.rollbackWay,
      ticketId,
      currentActivityId: tacheId,
      rollbackActivityId: values.rollbackActivityId,
      caseId,
      message: this.manageData(values),
      version
    }
    this.props.handleOk(data, 'remote_roll_back').then((result) => {
      this.hideModal()
    })
  }
  /* -----------------------------回退工单结束-------------------------------- */

  /* -----------------------------跳转工单开始-------------------------------- */

  // 独立显示的跳转按钮 点击事件,type为判断是否是会签和依次会签接子流程
  ticketJumpShow = async (jump, type) => {
    const cb = (data) => {
      const item = _.find(data.ruleVos, (rule) => {
        return (
          `${rule.activityFlowId}${rule.approvalResult}` ===
          `${jump.activityFlowId}${jump.approvalResult}`
        )
      })
      if (_.isEmpty(item)) {
        Modal.error({
          title: i18n('not-find-activity-flowId', '无法获取正确得提交路径')
        })
        return false
      }
      var jumpActivity = {
        flowCode: item.flowCode,
        activityFlowId: item.activityFlowId,
        title: item.name
      }
      // 设置传入模态框的值
      if (type !== 2) {
        jumpActivity.id = item.jumpTache.tacheId // 跳转环节id，当跳转环节为并行组时无效
        jumpActivity.name = item.jumpTache.exclusiveGateway
          ? item.jumpTache.jumpActivityName
          : item.jumpTache.tacheName // 跳转环节名称,判断节点需要增加判断
        jumpActivity.users = item.jumpTache.users // 跳转环节可选用户，当跳转环节为并行组时无效
        jumpActivity.groups = item.jumpTache.groups
        jumpActivity.policy = item.jumpTache.policy // 跳转环节执行策略，当跳转环节为并行组时无效
        jumpActivity.tacheType = item.jumpTache.tacheType // 环节类型 0-普通环节 1-并行组
        jumpActivity.parallelismTaches = item.jumpTache.parallelismTaches // 并行组内的环节数组 为跳转组件选择跳转环节人员使用
        jumpActivity.isCountersign = item.jumpTache.jumpActivity || 0
        jumpActivity.jumpActivityId = item.jumpTache.jumpActivityId
        jumpActivity.exclusiveGateway = item.jumpTache.exclusiveGateway
        jumpActivity.approvalResult = item.approvalResult
        jumpActivity.forwardTacheList = item.jumpTache.forwardTacheList || []
      }
      if (this.state.btnInfo.messageStatus === 2) {
        const { policy, tacheType, parallelismTaches } = jumpActivity
        let falt = false
        if (tacheType === 1) {
          falt = _.some(parallelismTaches, (item) => item.policy === 1)
        } else if (tacheType === 0 && policy === 1) {
          falt = true
        }
        if (falt) {
          this.setState({ visible: 'jump', currentJump: jumpActivity })
        } else {
          this.setState({ currentJump: jumpActivity, loading: 'jump' }, () => {
            this.ticketJump()
          })
        }
      } else {
        this.setState({ visible: 'jump', currentJump: jumpActivity })
      }
    }
    try {
      this.setState({ loading: 'jump' })
      await this.props.validate(
        (values, xieBandanFlag) => {
          if (!xieBandanFlag) {
            this.setState({ loading: false })
            return false
          }
          this.setState({ formsData: values })
          this.props.getActivityById(
            {
              status: 1,
              id: this.props.formList.ticketId,
              tacheId: this.props.formList.tacheId,
              tacheType: this.props.formList.tacheType,
              caseId: this.props.formList.caseId,
              form: values
            },
            cb
          )
        },
        { action: 'jump', flowCode: jump.flowCode, type: jump?.btnType || '' }
      )
    } catch (e) {
      this.setState({ loading: '' })
    }
  }

  ticketJump = async () => {
    let values = {}
    if (this.jump) {
      values = await this.jump.validate()
    }
    this.submitbtnforbidden()
    const subExecutorsVos = []
    // 格式化并行节点中有子流程选人时的人员数据格式
    if (this.state.currentJump.parallelismTaches) {
      _.map(this.state.currentJump.parallelismTaches, (parallenlismTach) => {
        _.map(parallenlismTach.subModels, (subModel) => {
          const subExecutorsVo = {
            activityId: parallenlismTach.tacheId,
            modelId: subModel.id,
            executorsAndGroupIds: {}
          }
          _.map(subModel.tacheVoList, (tacheVo, index) => {
            const code = parallenlismTach.tacheId + tacheVo.tacheId
            if (tacheVo.policy === 2 && values[code]) {
              subExecutorsVo.executorsAndGroupIds[tacheVo.tacheId] = values[code]
              delete values[code]
            }
          })
          if (!_.isEmpty(subModel.tacheVoList)) {
            subExecutorsVos.push(subExecutorsVo)
          }
        })
      })
    }
    const data = this.getSubmitData(values)
    data.tacheId = this.state.currentJump.id // 跳转的时候要带上环节id
    data.caseId = this.props.formList.caseId
    if (!_.isEmpty(subExecutorsVos)) {
      data.subExecutorsVos = subExecutorsVos
    }

    // 高级模型的时候带上线的id、有审批结果带上审批结果
    if (+this.state.modelRule.modelType === 1) {
      data.flowId = this.state.currentJump.activityFlowId
      data.flowCode = this.state.currentJump.flowCode
      data.approvalResult = this.state.currentJump.approvalResult
    }
    if (data.tacheType === 2) {
      data.tacheId = this.state.modelRule.tacheId // 并行环节传当前的环节id
    }

    this.props.handleOk(data, 'jump').then((result) => {
      this.hideModal()
    })
  }
  /* ------------------------------跳转工单结束----------------------------- */

  /* ------------------------------废除工单开始----------------------------- */
  ticketDelete = async () => {
    let values = {}
    if (this.abolish) {
      values = await this.abolish.validate()
    }

    this.submitbtnforbidden()
    const data = this.getSubmitData(values)
    this.props.handleOk(data, 'abolish').then((result) => {
      this.hideModal()
    })
  }
  /* -----------------------------废除工单结束----------------------------------- */

  /* -----------------------------关闭工单开始----------------------------------- */

  ticketClose = async () => {
    let values = {}
    if (this.close) {
      values = await this.close.validate()
    }
    this.submitbtnforbidden()
    const data = this.getSubmitData(values)
    this.props.handleOk(data, 'close').then((result) => {
      this.hideModal()
    })
  }
  /* ----------------------------关闭工单结束----------------------------- */

  /* ----------------------------撤销工单开始----------------------------- */

  ticketRevoke = () => {
    this.submitbtnforbidden()
    this.props.handleOk({}, 'revoke').then((result) => {
      this.hideModal()
    })
  }
  /* -----------------------------撤销工单结束------------------------------ */

  /* --------------------------取回相关开始-wangyp-------------------------- */

  ticketRetrieve = async () => {
    let values = {}
    if (this.retrieve) {
      values = await this.retrieve.validate()
    }
    this.submitbtnforbidden()
    this.props.handleOk({ content: values.message }, 'retrieve').then((result) => {
      this.hideModal()
    })
  }
  /* --------------------------取回相关开始-wangyp----------------------------- */

  /* ----------------------------保存工单开始---------------------------------- */
  ticketSave = () => {
    const data = {
      ticketId: this.props.formList.ticketId,
      status: this.props.formList.status,
      tacheId: this.props.formList.tacheId
    }
    this.props.validate(
      () => {
        this.props.handleOk(data, 'save').then((result) => {
          if (result === 'save') {
            message.success(i18n('ticket.forms.save.sucess', '保存成功'))
          }
        })
      },
      { action: 'save' }
    )
  }
  /* ----------------------------保存工单结束------------------------------- */

  /* --------------------------重新打开开始-fb-------------------------- */

  ticketReopen = async () => {
    let values = {}
    if (this.reopen) {
      values = await this.reopen.validate()
    }
    if (this.restore) {
      values = await this.restore.validate()
    }
    this.submitbtnforbidden()
    return this.props.handleOk({ content: values.message }, 'reopen').then((result) => {
      this.hideModal()
    })
  }
  /* --------------------------重新打开结束-fb----------------------------- */

  /* --------------------------完成按钮-start----------------------------- */

  ticketFinish = async () => {
    let values = {}
    if (this.complete) {
      values = await this.complete.validate()
    }
    this.submitbtnforbidden()
    const data = this.getSubmitData(values)
    this.props.handleOk(data, 'complete').then((result) => {
      this.hideModal()
    })
  }

  handleRollBack = (item) => {
    this.setState(
      {
        rollBackId: item ? item.key : null
      },
      () => {
        this.showModal('rollBack')
      }
    )
  }

  /* ------------------------合并显示按钮跳转和发起子流程操作分发开始-------------------- */
  dispatchSubModelAndJump = (item) => {
    var index = _.findIndex(this.state.menuItemList, function (chr, index) {
      return (Array(4).join('0') + index).slice(-4) + chr.id === item.key // 按以前逻辑修改
    })
    var type = this.state.menuItemList[index].flag
    var current = this.state.menuItemList[index]
    var _this = this
    // 跳轉工單不做校驗
    if (type === 'jump') {
      this.props.validate(() => {
        _this.setState({
          visible: 'jump',
          currentJump: current
        })
      })
    } else if (type === 'sub') {
      this.ticketSubModelShow(current.item)
    } else {
      this.showModal('complete')
    }
  }
  /* ------------------------合并显示按钮跳转和发起子流程操作分发结束-------------------- */

  // 点击 审阅 按钮
  handleReview = (info = {}) => {
    if (info.messageStatus !== 2) {
      this.setState({
        visible: 'review'
      })
    } else {
      this.ticketReview()
    }
  }

  // 点击 加签 按钮
  ticketEndorsement = () => {
    const { formList, validate } = this.props
    const { status, isExcutor } = formList
    if (status === 2 && isExcutor) {
      // 工单处理中 、且为当前处理人时需校验表单
      validate(() => {
        this.setState({
          visible: 'endorsement'
        })
      })
    } else {
      this.setState({
        visible: 'endorsement'
      })
    }
  }

  // 确认加签
  handleTicketEndorsement = () => {
    this.endorsement.props.form.validateFields(async (errors, values) => {
      if (errors) return false
      this.submitbtnforbidden()
      this.setState({
        loading: 'endorsement'
      })
      const { formList, queryParams = {} } = this.props
      values.userAndGroups = _.reduce(
        values.userAndGroups,
        (result, value, key) => {
          if (value.type === 1) {
            result.user.push(value.id)
          }
          if (value.type === 0) {
            result.group.push(value.id)
          }
          return result
        },
        { user: [], group: [] }
      )
      const {
        status,
        isExcutor,
        tacheId: currentActivityId,
        modelId,
        caseId,
        tacheNo,
        tacheType,
        ticketId
      } = formList
      if (status === 2 && isExcutor) {
        this.props.validate((formsData) => {
          values.form = formsData
        })
      }
      const data = _.assign(
        {},
        { currentActivityId, ticketId, modelId, caseId, tacheNo, tacheType },
        values
      )
      const res = await this.props.ticketStore.handleTicketEndorsement(data)
      this.props.onValuesChange(false)
      if (this.props?.afterSubmitAction) {
        message.success(i18n('ticket.from.addSign.sucess', '加签成功'))
        this.hideModal()
        this.props.afterSubmitAction()
        return
      }
      const urlSearch = new URLSearchParams(this.props.location?.search || '')
      // debugger
      if (urlSearch.get('isPostMessage')) {
        // 组件
        if (res.needRefresh) {
          this.hideModal()
          const pathName = `/ticketDetail/${ticketId}/?${qs.stringify(
            queryParams
          )}&ticketSource=portal&hideHeader=1&hideHead=1&hideMenu=1&isPostMessage=1`
          this.props.history.replace(pathName)
          message.success(i18n('ticket.from.addSign.sucess', '加签成功'))
        } else {
          window.postMessage({ createTicket: 'success' }, '*')
          message.success(i18n('ticket.from.addSign.sucess', '加签成功'))
        }
      } else if (window.parent !== window) {
        // iframe
        if (res.needRefresh) {
          this.hideModal()
          const pathName = `/ticketDetail/${ticketId}/?${qs.stringify(
            queryParams
          )}&ticketSource=portal&hideHeader=1&hideHead=1&hideMenu=1`
          this.props.history.replace(pathName)
          message.success(i18n('ticket.from.addSign.sucess', '加签成功'))
        } else {
          window.parent.postMessage({ createTicket: 'success' }, '*')
          message.success(i18n('ticket.from.addSign.sucess', '加签成功'))
        }
      } else {
        if (res.needRefresh) {
          this.hideModal()
          // const newQueryParams = qs.stringify(_.assign({}, queryParams, { tacheId: res.newCurrentActivityId }))
          const pathName = `/ticket/detail/${ticketId}?${qs.stringify(queryParams)}`
          this.props.history.replace(pathName)
          message.success(i18n('ticket.from.addSign.sucess', '加签成功'))
        } else if (res.needRefresh === false) {
          this.props.history.push(getPerUrl(this.props.globalStore.defaultHome))
          message.success(i18n('ticket.from.addSign.sucess', '加签成功'))
        }
      }
    })
  }

  // 点击 提交 审阅
  ticketReview = async () => {
    const { formList } = this.props
    let values = {}
    if (this.reviewed) {
      values = await this.reviewed.validate()
    }
    const data = {
      ticketId: formList.ticketId,
      reviewActivity: formList.tacheId,
      suggestion: values.message
    }
    this.submitbtnforbidden()
    this.props.ticketReview(data).then((res) => {
      if (res === 'approved') {
        this.setState({ approved: true })
        this.hideModal()
      }
    })
    // this.review.props.form.validateFields((errors, values) => {
    //   if (errors) return false
    //   const data = {
    //     ticketId: formList.ticketId,
    //     reviewActivity: formList.tacheId,
    //     suggestion: values.suggestion
    //   }
    //   this.props.ticketReview(data).then(res => {
    //     if (res === 'approved') {
    //       this.setState({ approved: true })
    //       this.hideModal()
    //     }
    //   })
    // })
  }

  ticketUpdate = () => {
    const data = {
      ticketId: this.props.formList.ticketId,
      tacheType: this.props.formList.tacheType || 0,
      tacheNo: this.props.formList.tacheNo || 0
    }
    this.props.validate &&
      this.props.validate(
        () => {
          this.props.handleOk(data, 'update').then((result) => {
            if (result === 'update') {
              message.success(i18n('ticket.from.update.sucess', '更新成功'))
            }
          })
        },
        { action: 'update', flowCode: undefined }
      )
  }

  // 恢复
  ticketResume = async () => {
    let values = {}
    if (this.recovery) {
      values = await this.recovery.validate()
    }
    const data = {
      ticketId: this.props.formList.ticketId,
      isSuspend: this.props.formList.status === 10 ? 1 : 0,
      caseId: this.props.formList.caseId,
      content: values.message
    }
    this.props.validate(
      () => {
        this.setState({ loading: 'Resume' })
        this.props.ticketStore.ticketSuspendAndResume(data, () => {
          const tips =
            this.props.formList.status === 10
              ? i18n('ticket.list.Resumesuccess', '恢复成功')
              : i18n('ticket.list.Suspendsuccess', '挂起成功')
          message.success(tips)
          this.hideModal()
          this.props.getAgainDetailForms && this.props.getAgainDetailForms()
          this.props.lefRefresh()
        })
      },
      { action: data.isSuspend === 0 ? 'hang' : 'restore' }
    )
  }

  // 挂起
  ticketSuspend = async () => {
    let values = {}
    if (this.suspend) {
      values = await this.suspend.validate()
    }
    const data = {
      ticketId: this.props.formList.ticketId,
      isSuspend: this.props.formList.status === 10 ? 1 : 0,
      caseId: this.props.formList.caseId,
      content: values.message
    }
    this.props.validate(
      () => {
        this.setState({ loading: 'Resume' })
        this.props.ticketStore.ticketSuspendAndResume(data, () => {
          const tips =
            this.props.formList.status === 10
              ? i18n('ticket.list.Resumesuccess', '恢复成功')
              : i18n('ticket.list.Suspendsuccess', '挂起成功')
          message.success(tips)
          this.hideModal()
          this.props.getAgainDetailForms && this.props.getAgainDetailForms()
          this.props.lefRefresh()
        })
      },
      { action: data.isSuspend === 0 ? 'hang' : 'restore' }
    )
  }

  ticketReminder = async () => {
    let values = {}
    if (this.remind) {
      values = await this.remind.validate()
    }
    const data = this.getSubmitData(values)
    this.submitbtnforbidden()
    this.props.ticketStore.ticketReminder(
      { ticketId: this.props.formList.ticketId, message: data.message },
      (type) => {
        if (type === 'notAllow') {
          const seconds = this.props.globalStore.recentlyRemindTicketTime
          let minutes = 0
          let hours = 0
          let time = ''
          if (seconds) {
            minutes = Math.floor(seconds / 60)
            time = minutes + '分钟'
            if (minutes >= 60) {
              hours = Math.floor(seconds / 3600)
              time = hours + '小时'
            }
          }
          message.warning(`当前工单${time}内已催办一次，不可再次催办，请${time}后重试`)
          this.hideModal()
        } else {
          const { btnInfo } = this.state
          this.hideModal()
          message.success(
            btnInfo.modalTitle
              ? `${btnInfo.modalTitle}成功`
              : i18n('ticket.list.reminderSucess', '催办成功')
          )
          this.props.getAgainDetailForms && this.props.getAgainDetailForms()
        }
      }
    )
  }

  createRelateTicket = () => {
    this.props.validate(
      (formsData) => {
        this.props.ticketStore.setData({
          formsData,
          relationType: '4'
          // createVisible: true
        })
        this.setState({ coOrganizerVisible: true })
      },
      { action: 'createRelate' }
    )
  }

  handleCarbonCopy = (formValues) => {
    const { ticketId } = this.props.formList
    const { userAndGroup, types, message: formValuesMessage } = formValues
    const users = []
    const groups = []

    userAndGroup.forEach((item) => {
      if (item.type === 1) {
        users.push(item.id)
      } else {
        groups.push(item.id)
      }
    })

    const data = { ticketId, users, groups, types, message: formValuesMessage }

    this.submitbtnforbidden()
    axios.post(API.ticketCarbonCopy, data).then((res) => {
      if (res === '200') {
        message.success(i18n('carbon.copy.success'))
        this.hideModal()
        this.props.getAgainDetailForms && this.props.getAgainDetailForms()
      }
    })
  }

  // 获取可以回退的环节
  getRollbackTaches = async () => {
    // 1 自由回退 2 定点回退
    const { ticketId, caseId, rollbackWay } = this.props.formList
    const data = await axios.get(API.queryProcessedActivities, {
      params: { ticketId, caseId, rollbackWay }
    })
    this.setState({ rollBackList: data })

    return data
  }

  handleLoadRollBack = (visible) => {
    if (visible && _.isEmpty(this.state.rollBackList)) {
      this.getRollbackTaches()
    }
  }

  // 点击定点回退
  handleFixedPointBack = () => {
    const { rollBackList } = this.state

    if (_.isEmpty(rollBackList)) {
      this.getRollbackTaches().then((data) => {
        if (data && data.length > 0) {
          this.handleRollBack({ key: data[0].tacheId })
        }
      })
    } else {
      this.handleRollBack({ key: rollBackList[0].tacheId })
    }
  }

  /**
   * 快速回退后的提交
   */
  handleQuickSubmit = async () => {
    const cb = () => {
      this.setState({ visible: 'jump' })
    }
    try {
      this.setState({ loading: 'jump' })
      await this.props.validate(
        (values) => {
          this.setState({ formsData: values })
          this.props.getActivityById(
            {
              status: 1,
              id: this.props.formList.ticketId,
              tacheId: this.props.formList.tacheId,
              tacheType: this.props.formList.tacheType,
              caseId: this.props.formList.caseId,
              form: values
            },
            cb
          )
        },
        { action: 'jump' }
      )
    } catch (e) {
      this.setState({ loading: '' })
    }
  }

  handleMultiPerformer = async (data, form) => {
    const { ticketId, caseId, tacheId } = this.props.formList
    const res = await axios.get(API.queryCounterSignUserAndGroups, {
      params: { caseId, activityId: tacheId }
    })
    if (
      res &&
      res.length > 0 &&
      data.addPerformers.some((item) => res.some((i) => i.id === item))
    ) {
      message.error('已有此处理人，添加的会签人重复了！')
      return
    }
    this.setState({ multiPerformerLoading: true })
    axios
      .post(API.ticketAddCounterSignPerformer, { ticketId, caseId, activityId: tacheId, ...data })
      .then((res) => {
        if (res === '200') {
          message.success('添加成功')
          this.setState({ multiPerformerLoading: false })
          this.hideModal()
          form.resetFields()
          this.props.getAgainDetailForms && this.props.getAgainDetailForms()
        }
      })
  }

  // 新建协办单按钮
  renderRelateButton() {
    const { formList, isReceiveTicket, ticketSource } = this.props
    const { status, isExcutor, createCoOrganizer, inRemoteStatus } = formList
    const { hideCreateCoOrganizer } = this.state

    // 作为iframe时，不会显示关联工单的tab，所以这个按钮就没用了
    if (ticketSource || inRemoteStatus !== 0) {
      return null
    }

    if (
      (status === 1 || status === 2) &&
      isExcutor &&
      !isReceiveTicket &&
      createCoOrganizer === 1 &&
      !hideCreateCoOrganizer
    ) {
      //   return (
      //     <Button loading={!!loading} onClick={this.createRelateTicket}>
      //       {i18n('ticket.create.relationshipTicket', '新建协办单')}
      //     </Button>
      //   )
      return true
    }
    return null
  }

  // 提交按钮(敏捷模型在用)
  renderSubmitButton() {
    const { formList, isReceiveTicket } = this.props
    const { status, isExcutor, unfinishedCoOrder, isCountersign, inRemoteStatus } = formList
    const { loading, modelRule, menuItem, menuItemList } = this.state

    if (inRemoteStatus !== 0) {
      return null
    }
    if (menuItem.length === 0) {
      _.map(menuItemList, (item, index) => {
        const key = (Array(4).join('0') + index).slice(-4) + item.id // 牛逼代码，真他妈坑
        menuItem.push(<MenuItem key={key}>{item.name}</MenuItem>)
      })
    }

    const SubModel = <Menu onClick={this.dispatchSubModelAndJump}>{menuItem}</Menu>

    if (
      (status === 1 || status === 2) &&
      isExcutor &&
      !isReceiveTicket &&
      !unfinishedCoOrder &&
      modelRule &&
      modelRule.defaultButton
    ) {
      const title = modelRule.submitName || undefined

      if (menuItem.length === 0 || isCountersign) {
        return (
          <Tooltip placement="left" title={title}>
            <Button
              loading={!!loading}
              type="primary"
              className="submit-btn"
              onClick={() => this.showModal('submit')}
            >
              {i18n('globe.submit', '提交')}
            </Button>
          </Tooltip>
        )
      } else {
        return (
          <Tooltip placement="left" title={title}>
            <Dropdown.Button
              loading={!!loading}
              className="ticket-submit submit-btn"
              trigger={['hover']}
              overlay={SubModel}
              onClick={() => this.showModal('submit')}
            >
              {i18n('globe.submit', '提交')}
            </Dropdown.Button>
          </Tooltip>
        )
      }
    }
    return null
  }

  // 跨租户提交
  renderCrossUnitSubmit() {
    const { unitReassignVo, inRemoteStatus } = this.props.formList
    const { loading } = this.state
    if (inRemoteStatus !== 0) {
      return null
    }

    if (unitReassignVo.crossUnitCommit === 1) {
      return (
        <Button
          loading={!!loading}
          onClick={() => {
            this.props.validate(
              (values) => {
                this.showModal('crossUnitSubmit')
              },
              { action: 'jump' }
            )
          }}
        >
          {i18n('globe.submit', '提交')}
        </Button>
      )
    }

    return null
  }

  // 快速回退提交
  quickRollbackBtn() {
    const { formList, isReceiveTicket } = this.props
    const {
      status,
      isExcutor,
      unfinishedCoOrder,
      isCountersign,
      canSubmit,
      quickRollback,
      unitReassignVo,
      inRemoteStatus
    } = formList
    const { loading, modelRule } = this.state
    const buttonList = []

    // 存在跨租户提交时，屏蔽普通提交按钮
    if (!canSubmit || unitReassignVo.crossUnitCommit === 1 || inRemoteStatus !== 0) {
      return null
    }

    if (quickRollback) {
      buttonList.push(
        <Button
          type="primary"
          loading={Boolean(loading)}
          disabled={this.props.visible}
          onClick={() => this.handleQuickSubmit()}
        >
          {i18n('globe.submit', '提交')}
        </Button>
      )
    }

    if (
      status === 2 &&
      isExcutor &&
      !isReceiveTicket &&
      !unfinishedCoOrder &&
      (modelRule.modelType === 1 || (buttonList.lenght > 0 && !isCountersign))
    ) {
      return buttonList
    }
    return null
  }

  // 查看远程协助按钮
  renderViewRemoteRecordsButton() {
    const { ticketId } = this.props.formList

    return <ViewRemoteRecordsButton ticketId={ticketId} />
  }

  confirmPassOrNot = async (pass) => {
    const { ticketId, tacheId, caseId } = this.props.formList
    let values = { message: '' }
    if (pass === 0) {
      values = await this.confirmNotPass.validate()
      this.setState({ btnload: true })
    } else {
      this.setState({ loading: 'confirm' })
    }
    const params = {
      ticketId: ticketId,
      tacheId: tacheId, // 源工单当前节点id
      message: { toUserList: [], content: values.message }, // 处理意见（按照提交时处理意见的格式传）
      acceptFlag: pass, // 是否确认通过，1通过；0 不通过
      caseId: caseId // 源工单caseId
    }

    const res = await this.props.ticketStore.remoteConfirm(params)
    if (res) {
      if (pass === 0) {
        this.setState({ btnload: false })
        this.hideModal()
        this.props.history.push('/ticket/all')
      } else {
        this.setState({ loading: false })
        this.props.getAgainDetailForms && this.props.getAgainDetailForms()
      }
    }
  }

  renderWaitRemoteConfirmButton() {
    return (
      <>
        <Button className="mgr-right" onClick={() => this.confirmPassOrNot(1)}>
          {i18n('confirmPass', '确认通过')}
        </Button>
        <Button onClick={() => this.showModal('confirmNotPass')}>
          {i18n('confirmNotPass', '确认不通过')}
        </Button>
      </>
    )
  }

  showMultiPerformer = () => {
    this.setState({ visible: 'multiPerformer' })
  }

  showReminder = (info) => {
    this.props.validate(
      () => {
        if (info.messageStatus !== 2) {
          this.showModal('remind')
        } else {
          this.ticketReminder()
        }
      },
      { action: 'urgent' }
    )
  }

  showCc = () => {
    this.setState({ visible: 'cc' })
  }

  getBtnInfo = (btnInfo) => {
    this.setState({ btnInfo })
  }

  finishCoOrganizer = async () => {
    const {
      formList: { ticketId, tacheId }
    } = this.props
    const params = {
      ticketId,
      tacheId,
      operateType: 'FINISH'
    }
    await this.props.ticketStore.finishAssitTicket(params)
    this.setState({ hideCreateCoOrganizer: true })
  }

  submitRemoteRollbacked = async () => {
    let modalValues = {}
    if (this.rollback) {
      modalValues = await this.rollback.validate()
    }
    const {
      formList: { ticketId, tacheId, caseId, version }
    } = this.props
    this.props.validate(
      (values) => {
        const data = {
          ticketId,
          currentActivityId: tacheId,
          caseId,
          version,
          form: values,
          messageVo: this.manageData(modalValues)
        }
        this.props.handleOk(data, 'remote_submit').then((result) => {
          this.hideModal()
        })
      },
      { action: 'remote_submit' }
    )
  }

  renderRemoteSubmit = () => {
    const { remoteQuickRollBack, status, isExcutor } = this.props.formList
    if (remoteQuickRollBack && [1, 2].includes(status) && isExcutor) {
      return (
        <Button type="primary" onClick={() => this.showModal('remote_submit')}>
          {i18n('globe.submit', '提交')}
        </Button>
      )
    }
  }

  render() {
    const { formList } = this.props
    let fields = []
    _.forEach(formList.formLayoutVos, (d) => {
      if (d.type === 'group') {
        fields = [...d.fieldList, ...fields]
      } else {
        _.forEach(d.tabs, (tab) => {
          fields = [...fields, ...tab.fieldList]
        })
      }
    })
    const {
      formsData,
      btnload,
      submodelItem,
      submodelVisible,
      loading,
      btnVisible,
      approved,
      modelRule,
      rollBackList,
      btnInfo,
      coOrganizerVisible
    } = this.state
    const dilver = {
      handleSubmodel: this.handleSubmodel,
      formsData,
      submodelItem,
      visible: submodelVisible,
      ticketSubModelShow: this.ticketSubModelShow,
      activityId: formList.tacheId, // 当前节点id
      modelId: formList.modelId,
      fields
    }
    const editBtnProps = {
      ...this.props,
      loading,
      btnVisible,
      approved,
      modelRule,
      rollBackList,
      restrictBtns: this.props.ticketStore.restrictBtns,
      handleLoadRollBack: this.handleLoadRollBack,
      handleFixedPointBack: this.handleFixedPointBack,
      handleRollBack: this.handleRollBack,
      ticketJumpShow: this.ticketJumpShow,
      ticketSubModelShow: this.ticketSubModelShow,
      showModal: this.showModal,
      ticketReceive: this.ticketReceive,
      showMultiPerformer: this.showMultiPerformer,
      showReminder: this.showReminder,
      ticketEndorsement: this.ticketEndorsement,
      ticketUpdate: this.ticketUpdate,
      ticketSave: this.ticketSave,
      handleReview: this.handleReview,
      showCc: this.showCc,
      getBtnInfo: this.getBtnInfo,
      finishCoOrganizer: this.finishCoOrganizer,
      coOperation: {
        createCoOrganizer: this.renderRelateButton(),
        createRelateTicket: this.createRelateTicket
      }
    }
    return (
      <React.Fragment>
        {/* 远程回退过来的单子需要加一个提交按钮 */}
        {this.renderRemoteSubmit()}
        {
          // inRemoteStatus为1表示已创建远程工单
          // formList.inRemoteStatus === 0 && (
          <>
            {/* 跨租户提交 */}
            {this.renderCrossUnitSubmit()}
            {/* 提交按钮(敏捷模型在用) */}
            {this.renderSubmitButton()}
            {/* 快速回退提交 */}
            {this.quickRollbackBtn()}
            {/* 按钮显示需按顺序显示 */}
            <EditBtn {...editBtnProps} />
            {/* 新建协办单按钮 */}
            {/* {this.renderRelateButton()} */}
          </>
          // )
        }

        {/* {formList.status === 15 && this.renderWaitRemoteConfirmButton()} */}
        {formList.inRemoteStatus === 1 && this.renderViewRemoteRecordsButton()}
        {formList.inRemoteStatus === 2 && (
          <>
            {this.renderViewRemoteRecordsButton()}
            {this.renderWaitRemoteConfirmButton()}
          </>
        )}

        {/* 完成提交弹框 */}
        <Modal
          title={i18n('ticket.detail.complete', '完成提交')}
          className="finish-submit"
          confirmLoading={this.state.btnload}
          visible={this.state.visible === 'submit'}
          onOk={this.ticketSubmit}
          onCancel={this.hideModal}
        >
          <TicketSubmit
            isRequiredHandingSuggestion={
              this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
            }
            setFlowUser={this.setFlowUser}
            visible={this.state.visible === 'submit'}
            orgId={formList.currDepart || null} // 开启组织机构时  传 所属部门的id
            id={formList.ticketId}
            activityPolicy={formList.activityPolicy}
            nextActivity={this.state.nextActivity}
            caseId={formList.caseId}
            wrappedComponentRef={(node) => (this.submit = node)}
          />
        </Modal>
        {/* 发起子流程弹框 */}
        <Modal
          title={this.state.subModel ? this.state.subModel.name : ''}
          className="finish-submit"
          setFlowUser={this.setFlowUser}
          confirmLoading={this.state.btnload}
          visible={this.state.visible === 'submodel'}
          onOk={this.ticketSubmodel}
          onCancel={() => {
            this.submitbtnforbidden()
            this.hideModal()
          }}
        >
          {this.state.visible === 'submodel' && (
            <TicketSubmodel
              visible={this.state.visible === 'submodel'}
              modelType={this.state.modelRule && this.state.modelRule.modelType}
              id={formList.ticketId}
              isRequiredHandingSuggestion={
                this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
              }
              modelId={formList.subModelId || formList.modelId} // 加subModelId是为了解决主流程里子流程用主流程的modelId
              tacheId={formList.tacheId}
              flowId={this.state.subModel.item.activityFlowId}
              setFlowUser={this.setFlowUser}
              submodelType={this.state.subModel ? this.state.subModel.submodelType : ''}
              model={this.state.subModel}
              tache={this.state.subModel ? this.state.subModel.jumpActivity : {}}
              activityPolicy={formList.activityPolicy}
              orgId={formList.currDepart || null} // 开启组织机构时  传 所属部门的id
              needSuspend={this.state.subModel ? this.state.subModel.needSuspend : 0}
              nextActivity={this.state.nextActivity}
              // 手动建单传子流程表单数据，自动建单传父流程表单数据
              formValue={
                this.state.subModel.autoCreateTicket === 1
                  ? this.state.subModel.submodelData.formsData
                  : formsData
              }
              caseId={formList.caseId}
              wrappedComponentRef={(node) => (this.submodel = node)}
              btnInfo={this.state.subModel ? getLinkBtnInfo(this.state.subModel.item, btnInfo) : {}}
              onlyMessage={this.state.onlyMessage}
            />
          )}
        </Modal>
        {/* 工单改派弹框 */}
        <Modal
          title={
            btnInfo.btnType === 'reassignment'
              ? btnInfo.modalTitle
              : i18n('ticket.detail.assignment', '工单改派')
          }
          visible={this.state.visible === 'reassign'}
          className="finish-submit"
          onOk={this.ticketReassign}
          onCancel={this.hideModal}
          confirmLoading={this.state.btnload}
        >
          {this.state.visible === 'reassign' && (
            <TicketReassign
              visible={this.state.visible === 'reassign'}
              modelType={this.state.modelRule && this.state.modelRule.modelType}
              id={formList.ticketId}
              formList={formList}
              isRequiredHandingSuggestion={
                this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
              }
              modelRule={this.state.modelRule}
              setFlowUser={this.setFlowUser}
              isManager={formList.isManager}
              orgId={formList.currDepart || null} // 开启组织机构时  传 所属部门的id
              tacheId={formList.tacheId}
              modelId={formList.subModelId || formList.modelId}
              ressignAndCountersign={formList.isCountersign}
              nextActivity={this.state.nextActivity}
              caseId={formList.caseId}
              wrappedComponentRef={(node) => (this.reassign = node)}
              btnInfo={btnInfo.btnType === 'reassignment' ? btnInfo : {}}
            />
          )}
        </Modal>
        {/* 工单跨租户改派 */}
        <CrossUnitReassignModal
          visible={this.state.visible === 'crossUnitReassign'}
          confirmLoading={this.state.btnload}
          onOk={this.ticketCrossUnitReassign}
          onCancel={this.hideModal}
          btnInfo={btnInfo.btnType === 'cross_unit_reassignment' ? btnInfo : {}}
        />
        {/* 远程工单 */}
        <RemoteTicketModal
          nodeList={formList.remoteNodeInfos || []}
          visible={this.state.visible === 'remoteTicket'}
          confirmLoading={this.state.btnload}
          onOk={this.remoteTicket}
          onCancel={this.hideModal}
          btnInfo={btnInfo.btnType === 'remote_ticket' ? btnInfo : {}}
        />
        {/* 跨租户提交 */}
        <Modal
          title={'提交'}
          className="finish-submit"
          visible={this.state.visible === 'crossUnitSubmit'}
          confirmLoading={btnload}
          onOk={this.ticketCrossUnitSubmit}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            isRequiredHandingSuggestion={
              this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
            }
            visible={this.state.visible === 'crossUnitSubmit'}
            wrappedComponentRef={(node) => (this.crossUnitSubmit = node)}
          />
        </Modal>
        {/* 工单跳转弹框 */}
        <Modal
          destroyOnClose
          title={this.state.currentJump ? this.state.currentJump.title : ''}
          className="finish-submit"
          visible={this.state.visible === 'jump'}
          confirmLoading={this.state.btnload}
          onOk={this.ticketJump}
          onCancel={this.hideModal}
        >
          {this.state.modelRule && this.state.modelRule.modelType ? (
            <SeniorJump
              visible={this.state.visible === 'jump'}
              id={formList.ticketId}
              isRequiredHandingSuggestion={
                this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
              }
              modelType={this.state.modelRule && this.state.modelRule.modelType}
              modelId={formList.subModelId || formList.modelId}
              tacheId={formList.tacheId}
              setFlowUser={this.setFlowUser}
              tache={this.state.currentJump}
              caseId={formList.caseId}
              orgId={formList.currDepart || null} // 开启组织机构时  传 所属部门的id
              formValue={formsData}
              nextActivity={this.state.nextActivity}
              activityType={this.props.formList.activityType}
              wrappedComponentRef={(node) => (this.jump = node)}
              btnInfo={getLinkBtnInfo(this.state.currentJump, btnInfo)}
            />
          ) : (
            <TicketJump
              visible={this.state.visible === 'jump'}
              id={formList.ticketId}
              isRequiredHandingSuggestion={
                this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
              }
              modelType={this.state.modelRule && this.state.modelRule.modelType}
              modelId={formList.subModelId || formList.modelId}
              tacheId={formList.tacheId}
              setFlowUser={this.setFlowUser}
              tache={this.state.currentJump}
              orgId={formList.currDepart || null} // 开启组织机构时  传 所属部门的id
              nextActivity={this.state.nextActivity}
              caseId={formList.caseId}
              formValue={formsData}
              wrappedComponentRef={(node) => (this.jump = node)}
            />
          )}
        </Modal>
        {/** 工单催办弹框 */}
        <Modal
          title={
            btnInfo.btnType === 'reminder'
              ? btnInfo.modalTitle
              : i18n('ticket.list.reminder', '催办')
          }
          className="finish-submit"
          visible={this.state.visible === 'remind'}
          confirmLoading={btnload}
          onOk={this.ticketReminder}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            setFlowUser={this.setFlowUser}
            isRequiredHandingSuggestion={
              this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
            }
            visible={this.state.visible === 'remind'}
            wrappedComponentRef={(node) => (this.remind = node)}
            btnInfo={btnInfo.btnType === 'reminder' ? btnInfo : {}}
          />
        </Modal>
        {/* 工单回退弹框 */}
        <Modal
          title={
            btnInfo.btnType === 'rollback' ? btnInfo.modalTitle : i18n('globe.rollback', '回退')
          }
          className="finish-submit"
          visible={this.state.visible === 'rollBack'}
          confirmLoading={btnload}
          setFlowUser={this.setFlowUser}
          onOk={this.ticketRollBack}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            rollbackResumeType={formList.rollbackResumeType}
            isRequiredHandingSuggestion={
              this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
            }
            visible={this.state.visible === 'rollBack'}
            wrappedComponentRef={(node) => (this.rollback = node)}
            btnInfo={btnInfo.btnType === 'rollback' ? btnInfo : {}}
          />
        </Modal>
        {/* 工单废除弹框 */}
        <Modal
          visible={this.state.visible === 'abolish'}
          className="finish-submit"
          title={btnInfo.btnType === 'abolish' ? btnInfo.modalTitle : i18n('globe.abolish', '废除')}
          confirmLoading={btnload}
          setFlowUser={this.setFlowUser}
          onOk={this.ticketDelete}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            isRequiredHandingSuggestion={
              this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
            }
            setFlowUser={this.setFlowUser}
            visible={this.state.visible === 'abolish'}
            wrappedComponentRef={(node) => (this.abolish = node)}
            btnInfo={btnInfo.btnType === 'abolish' ? btnInfo : {}}
          />
        </Modal>
        {/* 工单关闭弹框 */}
        <Modal
          visible={this.state.visible === 'close'}
          className="finish-submit"
          title={btnInfo.btnType === 'close' ? btnInfo.modalTitle : i18n('globe.close', '关闭')}
          confirmLoading={btnload}
          setFlowUser={this.setFlowUser}
          onOk={this.ticketClose}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            setFlowUser={this.setFlowUser}
            isRequiredHandingSuggestion={
              this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
            }
            visible={this.state.visible === 'close'}
            wrappedComponentRef={(node) => (this.close = node)}
            btnInfo={btnInfo.btnType === 'close' ? btnInfo : {}}
          />
        </Modal>
        {/* 工单撤销弹框(未用) */}
        <Modal
          visible={this.state.visible === 'revoked'}
          onOk={this.ticketRevoke}
          onCancel={this.hideModal}
        >
          <p>{i18n('ticket.detail.revoked', '确定撤销工单？')}</p>
        </Modal>
        {/* 工单取回弹框 */}
        <Modal
          visible={this.state.visible === 'retrieve'}
          confirmLoading={btnload}
          onOk={this.ticketRetrieve}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            visible={this.state.visible === 'retrieve'}
            wrappedComponentRef={(node) => (this.retrieve = node)}
            btnInfo={btnInfo.btnType === 'revoke' ? btnInfo : {}}
          />
          {/* <p>{ i18n('ticket.detail.retrieve', '确定取回工单？')}</p> */}
        </Modal>
        {/* 重开 和 关闭 是关联的 */}
        <Modal
          visible={this.state.visible === 'reopen'}
          title={btnInfo.btnType === 'close' ? btnInfo.relationTitle : '重开'}
          confirmLoading={btnload}
          onOk={this.ticketReopen}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            visible={this.state.visible === 'reopen'}
            wrappedComponentRef={(node) => (this.reopen = node)}
            btnInfo={btnInfo.btnType === 'close' ? btnInfo : {}}
          />
          {/* <p>{ i18n('ticket.detail.reopenMsg', '确定重开工单？')}</p> */}
        </Modal>
        {/* 还原 和 废除 是关联的 */}
        <Modal
          visible={this.state.visible === 'restore'}
          title={btnInfo.btnType === 'abolish' ? btnInfo.relationTitle : '还原'}
          confirmLoading={btnload}
          onOk={this.ticketReopen} // 和重开 同一个接口
          onCancel={this.hideModal}
        >
          <TicketRollBack
            visible={this.state.visible === 'restore'}
            wrappedComponentRef={(node) => (this.restore = node)}
            btnInfo={btnInfo.btnType === 'abolish' ? btnInfo : {}}
          />
          {/* <p>{ i18n('ticket.detail.reopenMsg', '确定重开工单？')}</p> */}
        </Modal>
        {/* 工单直接完成提交 */}
        <Modal
          className="finish-submit"
          title={btnInfo.modalTitle || i18n('pandect.complete', '完成')}
          visible={this.state.visible === 'complete'}
          onOk={this.ticketFinish}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            visible={this.state.visible === 'complete'}
            wrappedComponentRef={(node) => (this.complete = node)}
            btnInfo={btnInfo}
          />
        </Modal>
        {/* 审阅 弹框 */}
        <Modal
          title={
            btnInfo.btnType === 'reviewed'
              ? btnInfo.messageName
              : i18n('review.comments', '审阅意见')
          }
          visible={this.state.visible === 'review'}
          confirmLoading={btnload}
          onOk={this.ticketReview}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            visible={this.state.visible === 'review'}
            wrappedComponentRef={(node) => (this.reviewed = node)}
            btnInfo={btnInfo.btnType === 'reviewed' ? btnInfo : {}}
          />
        </Modal>
        {/* 抄送 弹框 */}
        <CarbonCopyModal
          destroyOnClose
          visible={this.state.visible === 'cc'}
          confirmLoading={btnload}
          onOk={this.handleCarbonCopy}
          onCancel={this.hideModal}
          btnInfo={btnInfo.btnType === 'cc' ? btnInfo : {}}
        />
        {/* 加签 弹框 */}
        <Modal
          destroyOnClose
          title={
            btnInfo.btnType === 'addSign' ? btnInfo.modalTitle : i18n('globe.endorsement', '加签')
          }
          visible={this.state.visible === 'endorsement'}
          confirmLoading={btnload}
          onOk={this.handleTicketEndorsement}
          onCancel={this.hideModal}
        >
          <EndorsementModal
            formList={formList}
            visible={this.state.visible === 'endorsement'}
            wrappedComponentRef={(node) => (this.endorsement = node)}
            btnInfo={btnInfo.btnType === 'addSign' ? btnInfo : {}}
          />
        </Modal>
        {/* 会签添加人员弹窗 */}
        <MultiPerformerModal
          title={btnInfo.btnType === 'add_multi_performer' ? btnInfo.modalTitle : '添加会签人员'}
          multiPerformerLoading={this.state.multiPerformerLoading}
          onCancel={() => {
            this.setState({ multiPerformerLoading: false })
            this.hideModal()
          }}
          visible={this.state.visible === 'multiPerformer'}
          onOk={(data, form) => this.handleMultiPerformer(data, form)}
          btnInfo={btnInfo.btnType === 'add_multi_performer' ? btnInfo : {}}
        />
        <CreateSubmodel {...dilver} parentFormList={formList} />
        {/* 挂起 */}
        <Modal
          title={btnInfo.btnType === 'suspend' ? btnInfo.messageName : '挂起'}
          visible={this.state.visible === 'suspend'}
          confirmLoading={btnload}
          onOk={this.ticketSuspend}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            visible={this.state.visible === 'suspend'}
            wrappedComponentRef={(node) => (this.suspend = node)}
            btnInfo={btnInfo.btnType === 'suspend' ? btnInfo : {}}
          />
        </Modal>
        {/* 恢复 */}
        <Modal
          title={btnInfo.btnType === 'suspend' ? btnInfo.relationTitle : '恢复'}
          visible={this.state.visible === 'recovery'}
          confirmLoading={btnload}
          onOk={this.ticketResume}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            visible={this.state.visible === 'recovery'}
            wrappedComponentRef={(node) => (this.recovery = node)}
            btnInfo={btnInfo.btnType === 'suspend' ? btnInfo : {}}
          />
        </Modal>
        {/* 远程确认不通过时意见弹框 */}
        <Modal
          title={i18n('confirmNotPass', '确认不通过')}
          visible={this.state.visible === 'confirmNotPass'}
          confirmLoading={btnload}
          onOk={() => this.confirmPassOrNot(0)}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            visible={this.state.visible === 'confirmNotPass'}
            wrappedComponentRef={(node) => (this.confirmNotPass = node)}
            btnInfo={{ name: '确认不通过' }}
          />
        </Modal>
        {/* 远程工单回退弹框 */}
        <Modal
          title={
            btnInfo.btnType === 'remote_roll_back'
              ? btnInfo.modalTitle
              : i18n('globe.rollback', '回退')
          }
          className="finish-submit"
          visible={this.state.visible === 'remote_roll_back'}
          confirmLoading={btnload}
          setFlowUser={this.setFlowUser}
          onOk={this.ticketRemoteRollBack}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            id={formList.ticketId}
            rollbackResumeType={formList.rollbackResumeType}
            isRequiredHandingSuggestion={
              this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
            }
            visible={this.state.visible === 'remote_roll_back'}
            wrappedComponentRef={(node) => (this.rollback = node)}
            btnInfo={btnInfo.btnType === 'remote_roll_back' ? btnInfo : {}}
          />
        </Modal>
        {/* 远程工单被回退后的提交 */}
        <Modal
          title={i18n('globe.submit', '提交')}
          className="finish-submit"
          visible={this.state.visible === 'remote_submit'}
          confirmLoading={btnload}
          setFlowUser={this.setFlowUser}
          onOk={this.submitRemoteRollbacked}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            id={formList.ticketId}
            rollbackResumeType={formList.rollbackResumeType}
            isRequiredHandingSuggestion={
              this.state.modelRule && this.state.modelRule.isRequiredHandingSuggestion
            }
            visible={this.state.visible === 'remote_submit'}
            wrappedComponentRef={(node) => (this.rollback = node)}
            btnInfo={btnInfo.btnType === 'remote_submit' ? btnInfo : {}}
          />
        </Modal>
        {/* 跨系统远程节点撤回 */}
        <Modal
          title={i18n('globe.withdraw', '撤回')}
          visible={this.state.visible === 'retrieveRemoteTicket'}
          confirmLoading={btnload}
          onOk={this.clickRetrieveRemoteTicketBtn}
          onCancel={this.hideModal}
        >
          <TicketRollBack
            visible={this.state.visible === 'retrieveRemoteTicket'}
            wrappedComponentRef={(node) => (this.retrieveRemoteTicket = node)}
            isRequiredHandingSuggestion={1}
            btnInfo={{ name: '撤回' }}
          />
        </Modal>

        {/* 协办 */}
        {coOrganizerVisible ? (
          <RelateTicket
            source="CoOrganizer"
            coOrganizerVisible={coOrganizerVisible}
            onClose={() => {
              this.setState({ coOrganizerVisible: false })
            }}
            {...this.props}
          />
        ) : null}
      </React.Fragment>
    )
  }
}

export default LookBtn
