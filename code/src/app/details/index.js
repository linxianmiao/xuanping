import React, { Component } from 'react'
import { qs } from '@uyun/utils'
import * as mobx from 'mobx'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { store as runtimeStore } from '@uyun/runtime-react'
import { message, Modal, Spin } from '@uyun/components'
import { Provider, observer, inject } from 'mobx-react'
import { getPerUrl } from '~/components/common/getPerUrl'
import Head from './head'
import DetailList from './BasicInfo'
import CommentDetail from './commentDetail'
import Conflict from '../ticket/conflict'
import KB from '../ticket/kb'
import DetailTabs from './tab'
import PageHeader from '~/components/pageHeader'
import ContentLayout from '~/components/ContentLayout'
import removeSideEffect from '../create-ticket/removeSideEffect'
import Forms from '../ticket/forms'

import TicketStore from '../ticket-list/stores/ticketStore'
import ResourceStore from '../ticket-list/stores/resourceStore'
import CreateStore from '../create-ticket/stores/createStore'
import ProcessListStore from '../ticket-list/switchModel/store/processListStore'
import TicketFieldJobStore from '~/stores/TicketFieldJobStore'
import permissionListStore from '~/stores/permissionListStore'
import tableListStore from '~/stores/tableListStore'
import listStore from '~/list/stores/listStore'
import UserStore from '../ticket-list/stores/userStore'

import { getActionType, getActionTypeName } from './util'
import communication from '../ticket/forms/utils/communication'
import { getFieldsCode, realSubmit, widgetsEventError } from '../ticket/forms/utils/scriptfunc'
import ErrorBoundary from '~/components/ErrorBoundary'
import Step from '~/components/step'
import { planExecuteStep } from '~/ticket/forms/utils/logic'

import './style/index.less'
import _ from 'lodash'
import { hasRelateJob, getIsHideRelateJob } from '~/ticket/forms/utils/logic'

const ticketStore = new TicketStore()
const createStore = new CreateStore()
const resourceStore = new ResourceStore()
const processListStore = new ProcessListStore()
const ticketFieldJobStore = new TicketFieldJobStore()
const userStore = new UserStore()

function getStep(fieldList) {
  const jobExecuteStep = Array.isArray(fieldList)
    ? fieldList.find((item) => item.code === 'job_execute_step')
    : ''
  return jobExecuteStep ? jobExecuteStep?.defaultValue : ''
}

class Details extends Component {
  constructor(props) {
    super(props)

    // props中可能会传有ticketStore，比如详情中再侧滑详情的情况
    this.ticketStore = props.ticketStore || ticketStore
  }

  static defaultProps = {
    inContainer: false // 当前详情页是否被包裹在组件中，比如弹框、侧滑
  }

  static childContextTypes = {
    ticketId: PropTypes.string,
    ticketSource: PropTypes.string
  }

  details = React.createRef()

  current = {}

  state = {
    cacheSaveTime: null, // 最新的更新时间
    conflictResponse: {}, // 冲突数据
    visibleConflict: false, // 冲突弹框
    message: {}, // 提交的非form数据
    iframeVisible: false, // 侧滑弹框控制
    iframeSrc: '',
    iframeType: '',
    createData: null,
    formList: {},
    submitType: '',
    loading: false,
    btnCanClick: true,
    activityData: {},
    serviceData: null,
    olaAndSlaInfo: {},
    autoJobInfo: {},
    jobList: []
  }

  getChildContext() {
    const { ticketSource, ticketId } = this.getQueryParamsFromLocation()
    window.TICKETID = ticketId
    return { ticketId, ticketSource }
  }

  componentDidMount = () => {
    const { ticketId, tacheId, appkey } = this.getQueryParamsFromLocation()
    window.TICKETID = ticketId
    if (appkey) {
      window.LOWCODE_APP_KEY = appkey
    }
    if (window.location.href.includes('ticket.html') > -1) {
      this.props.loadFieldWidgetStore.getCustomFieldInfos()
      this.props.globalStore.getSwitch()
      this.props.globalStore.getAutomationPer()
    }
    this.getDetailForms()
    this.props.globalStore.checkUserChangeAuth({ ticketId, tacheId })
    this.current = this.details.current?.ticketforms.current.props.form
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this.getDetailForms(nextProps)
      this.onValuesChange(false)
    }
  }

  componentWillUnmount() {
    this.ticketStore.distory() // 初始化数据
    resourceStore.distory()
    permissionListStore.distory()
    window.LOWCODE_APP_KEY = ''
    // this.props.globalStore.getTicketRecord({})
  }

  getQueryParamsFromLocation = (props = this.props) => {
    const ticketId = props.match.params.id
    const search = props.location.search.slice(1)
    const locationQuery = qs.parse(search)
    return { ticketId, ...locationQuery }
  }

  queryOlaAndSlaInfo = async (ticketId) => {
    const res = (await axios.get(API.queryOlaAndSlaInfo, { params: { ticketId } })) || {}

    this.setState({ olaAndSlaInfo: res })
  }

  queryJobInfo = ({ ticketId, actId }) => {
    axios.get(API.getJobInfo, { params: { ticketId, actId } }).then((res) => {
      this.setState({ autoJobInfo: res || {} })
    })
  }

  // 获取工单详情
  getDetailForms = async (props = this.props, source) => {
    const { ticketId, tacheNo, tacheType, tacheId, modelId, caseId, isDrafts } =
      this.getQueryParamsFromLocation(props)
    this.setState({ loading: true })
    let data = {}
    if (source === 'jobReload') {
      // 作业结束时，同步自动化作业，url改变，重新请求, 只要工单id, 不需其他参数
      data = await this.ticketStore.getTicketDetail({ ticketId })
    } else {
      data = await this.ticketStore.getTicketDetail(
        { ticketId, tacheNo, tacheType, tacheId, modelId, caseId },
        isDrafts
      )
    }
    this.setState({ loading: false, cacheSaveTime: data.updateTimgLong, formList: data })
    // data.formLayoutType = 1
    let fields = []
    _.forEach(data.formLayoutVos, (d) => {
      if (d.type === 'group') {
        fields = [...d.fieldList, ...fields]
      } else {
        _.forEach(d.tabs, (tab) => {
          fields = [...fields, ...tab.fieldList]
        })
      }
    })
    const fieldTypes = _.map(fields, (field) => field.type)

    // 获取关联作业的数据
    let jobList = []
    if (fieldTypes.includes('job')) jobList = await ticketFieldJobStore.job_query(ticketId)
    this.setState(
      {
        jobList
      },
      () => {
        if (
          this.state.formList.status === 2 &&
          this.state.formList.inRemoteStatus !== 2 &&
          (this.state.formList.currexcutor || '').indexOf(runtimeStore.getState().user?.userId) !==
            -1
        ) {
          this.onValuesChange(true)
          window.FORM_LEAVE_NOTIRY = true
        } else {
          this.onValuesChange(false)
          window.FORM_LEAVE_NOTIRY = false
        }
      }
    )

    if (fields && fields.some((item) => item.type === 'resource')) {
      const { tacheId, caseId, modelId } = data
      //获取开启cmdb编辑权限的配置项字段
      let resourceFields =
        _.chain(fields)
          .filter((d) => d.type === 'resource' && d.checkEditPermission)
          .map((d) => d.code)
          .value() || []
      resourceStore.getResList(ticketId, { tacheId, caseId, modelId }, resourceFields) // 获取工单的cmdb数据
    }

    if (data.source === 'srvcat') {
      const res = await this.ticketStore.getTicketSrvcat(ticketId)
      this.setState({ serviceData: res })
    }

    resourceStore.checkUserPermission() // 检查cmdb权限
    if (fieldTypes.includes('permission')) {
      // 获取当前工单关联的用户组数据
      permissionListStore.getRelatedGroupsOfTicket(ticketId)
    }

    // 查看作业进度
    if (data.activityType && data.activityType === 'AutoTask') {
      this.queryJobInfo({ ticketId, actId: data.tacheId })
    }

    this.queryOlaAndSlaInfo(ticketId)
    // 合并工单点击工单标题打开的是抽屉，不需要渲染主页的pageHeader
    const { renderPager } = this.getQueryParamsFromLocation()
    if (renderPager !== 'false') {
      this.props.globalStore.getTicketRecord(data)
    }
  }

  // 接单 后 重新 获取 form 表单数据
  getAgainDetailForms = (props = this.props) => {
    this.setState({ loading: true })
    const { tacheNo, tacheType, tacheId, modelId, caseId, ticketId } =
      this.getQueryParamsFromLocation()
    this.ticketStore
      .getTicketDetail({ ticketId, tacheNo, tacheType, tacheId, modelId, caseId })
      .then((data) => {
        this.setState(
          {
            formList: data,
            loading: false
          },
          () => {
            if (
              this.state.formList.status === 2 &&
              this.state.formList.inRemoteStatus !== 2 &&
              (this.state.formList.currexcutor || '').indexOf(
                runtimeStore.getState().user?.userId
              ) !== -1
            ) {
              this.onValuesChange(true)
              window.FORM_LEAVE_NOTIRY = true
            } else {
              this.onValuesChange(false)
              window.FORM_LEAVE_NOTIRY = false
            }
          }
        )
        // 查看作业进度
        if (data.activityType && data.activityType === 'AutoTask') {
          this.queryJobInfo({ ticketId, actId: data.tacheId })
        }
      })
    this.ticketStore.getTicketDetailTabCounts(ticketId) // 接完单 后 刷新 tab数据数量统计
    this.ticketStore.getProcessRecord(ticketId, undefined, caseId) // 接完单 后 刷新 处理记录
    this.queryOlaAndSlaInfo(ticketId)
  }

  async checkXieBanDan() {
    const { formList } = this.state
    const { status, isExcutor, createCoOrganizer, isReceiveTicket, ticketId } = formList
    let flag = false // 默认没有创建协办单
    if (
      (status === 1 || status === 2) &&
      isExcutor &&
      !isReceiveTicket &&
      createCoOrganizer === 1
    ) {
      const params = {
        ticketId,
        relationType: 4,
        relationScope: 1
      }

      const res = await this.ticketStore.checkXiebandan(params)
      flag = res.relationTicketCount > 0
    } else {
      // 当没有协办单按钮时不用判断
      flag = true
    }
    return flag
  }

  // 点击确定按钮进行的验证操作
  handleOk = async (data, type) => {
    const forms = mobx.toJS(this.ticketStore.detailForms)
    const initForms = mobx.toJS(this.ticketStore.initializeForms)
    const flowCode = _.get(data, 'flowCode')
    const { formList } = this.state
    data = _.omit(data, ['flowCode'])
    let fromData // 获取的forms的数据
    let submitData // 提交给后端的数据
    let origin = null // 用于冲突检测的初始数据
    let current = null // 用于冲突检测的改变以后的数据
    let options = {} //
    let updateData // 远程工单创建时需要先保存工单数据
    /**
     * type === conflict 时为冲突以后的数据，data不再是提交的工单id以及用户信息，之前提交的信息已经用state存储，传了下去
     * 所以可以直接使用
     */
    if (type === 'conflict') {
      const oldFormData =
        this.details.current.ticketforms.current.props.form &&
        this.details.current.ticketforms.current.props.form.getFieldsValue()
      fromData = _.cloneDeep(data.form)
      const dataMessage = _.omit(data, 'form')
      const newFormData = _.assign({}, oldFormData, data.form)
      submitData = _.assign({}, dataMessage, { form: newFormData })
    } else if (
      type !== 'receive' &&
      type !== 'rollBack' &&
      type !== 'remoteTicket' &&
      type !== 'remote_roll_back' &&
      type !== 'retrieveRemoteTicket'
    ) {
      await resourceStore.postResList(forms.ticketId, forms.modelId) // 提交配置项数据
      await permissionListStore.postPermissionList(forms.ticketId) // 提交服务自权限数据
      await tableListStore.saveTableData(true) // 保存表格字段数据
      await ticketFieldJobStore.job_relate(forms.ticketId) // 提交作业数据，需要在提交工单前
      fromData =
        this.details.current.ticketforms.current.props.form &&
        this.details.current.ticketforms.current.props.form.getFieldsValue() // 获取提交的表单数据
      if (resourceStore.sandboxId) {
        fromData.sandboxId = resourceStore.sandboxId
      }

      const resourceCodes = []
      _.forEach(formList.formLayoutVos, (item) => {
        if (item.type === 'group') {
          _.forEach(item.fieldList, (field) => {
            if (field.type === 'resource') {
              resourceCodes.push(field.code)
            }
          })
        } else {
          _.forEach(item.tabs, (tab) => {
            _.forEach(tab.fieldList, (field) => {
              if (field.type === 'resource') {
                resourceCodes.push(field.code)
              }
            })
          })
        }
      })
      _.forEach(resourceCodes, (d) => {
        if (Array.isArray(fromData[d])) {
          fromData[d] = _.filter(fromData[d], (d2) => !d2.taskId)
        }
      })
      // 清空原表格字段的默认数据
      tableListStore.list.forEach((store) => {
        fromData[store.params.fieldCode] = []
      })

      // 问题 ： 字段有默认值，然后删除完以后为undefined，不会传给后端，这个时候在下一个环节的时候，还会有默认值
      _.forEach(fromData, (value, key) => {
        fromData[key] = value === undefined ? null : value
      })
      // version防止重复提交
      submitData = _.assign({}, data, { form: fromData, version: forms.version || null })
    } else if (type === 'rollBack') {
      await tableListStore.saveTableData(true) // 保存表格字段数据
      fromData =
        this.details.current.ticketforms.current.props.form &&
        this.details.current.ticketforms.current.props.form.getFieldsValue() // 获取提交的表单数据
      if (resourceStore.sandboxId) {
        fromData.sandboxId = resourceStore.sandboxId
      }
      const resourceCodes = []
      _.forEach(formList.formLayoutVos, (item) => {
        if (item.type === 'group') {
          _.forEach(item.fieldList, (field) => {
            if (field.type === 'resource') {
              resourceCodes.push(field.code)
            }
          })
        } else {
          _.forEach(item.tabs, (tab) => {
            _.forEach(tab.fieldList, (field) => {
              if (field.type === 'resource') {
                resourceCodes.push(field.code)
              }
            })
          })
        }
      })
      _.forEach(resourceCodes, (d) => {
        if (Array.isArray(fromData[d])) {
          fromData[d] = _.filter(fromData[d], (d2) => !d2.taskId)
        }
      })
      submitData = {
        form: fromData,
        tacheId: data.tacheId, // 当前所在环节
        ticketId: data.ticketId, // 工单id
        rollbackWay: data.rollbackWay || 0, // 1 - 自由回退，0 - 逐级回退
        targetActivityId: data.targetActivityId, // 目标环节
        message: data.message
      }
      options = {
        caseId: forms.caseId,
        rollbackResumeType: data.rollbackResumeType // 1表示快速回退
      }
    } else if (type === 'remote_roll_back' || type === 'retrieveRemoteTicket') {
      await tableListStore.saveTableData(true) // 保存表格字段数据
      submitData = { ...data }
    } else if (type === 'remote_submit') {
      await resourceStore.postResList(forms.ticketId, forms.modelId) // 提交配置项数据
      await permissionListStore.postPermissionList(forms.ticketId) // 提交服务自权限数据
      await tableListStore.saveTableData(true) // 保存表格字段数据
      await ticketFieldJobStore.job_relate(forms.ticketId) // 提交作业数据，需要在提交工单前
      fromData =
        this.details.current.ticketforms.current.props.form &&
        this.details.current.ticketforms.current.props.form.getFieldsValue() // 获取提交的表单数据
      if (resourceStore.sandboxId) {
        fromData.sandboxId = resourceStore.sandboxId
      }

      const resourceCodes = []
      _.forEach(formList.formLayoutVos, (item) => {
        if (item.type === 'group') {
          _.forEach(item.fieldList, (field) => {
            if (field.type === 'resource') {
              resourceCodes.push(field.code)
            }
          })
        } else {
          _.forEach(item.tabs, (tab) => {
            _.forEach(tab.fieldList, (field) => {
              if (field.type === 'resource') {
                resourceCodes.push(field.code)
              }
            })
          })
        }
      })
      _.forEach(resourceCodes, (d) => {
        if (Array.isArray(fromData[d])) {
          fromData[d] = _.filter(fromData[d], (d2) => !d2.taskId)
        }
      })
      // 清空原表格字段的默认数据
      tableListStore.list.forEach((store) => {
        fromData[store.params.fieldCode] = []
      })

      // 问题 ： 字段有默认值，然后删除完以后为undefined，不会传给后端，这个时候在下一个环节的时候，还会有默认值
      _.forEach(fromData, (value, key) => {
        fromData[key] = value === undefined ? null : value
      })
      submitData = { ...data }
    } else if (type === 'remoteTicket') {
      await resourceStore.postResList(forms.ticketId) // 提交配置项数据
      await permissionListStore.postPermissionList(forms.ticketId) // 提交服务自权限数据
      await tableListStore.saveTableData(true) // 保存表格字段数据
      await ticketFieldJobStore.job_relate(forms.ticketId) // 提交作业数据，需要在提交工单前
      fromData =
        this.details.current.ticketforms.current.props.form &&
        this.details.current.ticketforms.current.props.form.getFieldsValue() // 获取提交的表单数据
      if (resourceStore.sandboxId) {
        fromData.sandboxId = resourceStore.sandboxId
      }

      const resourceCodes = []
      _.forEach(formList.formLayoutVos, (item) => {
        if (item.type === 'group') {
          _.forEach(item.fieldList, (field) => {
            if (field.type === 'resource') {
              resourceCodes.push(field.code)
            }
          })
        } else {
          _.forEach(item.tabs, (tab) => {
            _.forEach(tab.fieldList, (field) => {
              if (field.type === 'resource') {
                resourceCodes.push(field.code)
              }
            })
          })
        }
      })
      _.forEach(resourceCodes, (d) => {
        if (Array.isArray(fromData[d])) {
          fromData[d] = _.filter(fromData[d], (d2) => !d2.taskId)
        }
      })
      // 清空原表格字段的默认数据
      tableListStore.list.forEach((store) => {
        fromData[store.params.fieldCode] = []
      })

      // 问题 ： 字段有默认值，然后删除完以后为undefined，不会传给后端，这个时候在下一个环节的时候，还会有默认值
      _.forEach(fromData, (value, key) => {
        fromData[key] = value === undefined ? null : value
      })
      // version防止重复提交
      updateData = _.assign(
        {
          tacheNo: Number(forms.tacheNo),
          tacheType: Number(forms.tacheType),
          ticketId: forms.ticketId
        },
        { form: fromData, version: forms.version || null }
      )
      submitData = { ...data }
    } else {
      fromData =
        this.details.current.ticketforms.current.props.form &&
        this.details.current.ticketforms.current.props.form.getFieldsValue() // 获取提交的表单数据
      if (resourceStore.sandboxId) {
        fromData.sandboxId = resourceStore.sandboxId
      }

      const resourceCodes = []
      _.forEach(formList.formLayoutVos, (item) => {
        if (item.type === 'group') {
          _.forEach(item.fieldList, (field) => {
            if (field.type === 'resource') {
              resourceCodes.push(field.code)
            }
          })
        } else {
          _.forEach(item.tabs, (tab) => {
            _.forEach(tab.fieldList, (field) => {
              if (field.type === 'resource') {
                resourceCodes.push(field.code)
              }
            })
          })
        }
      })
      _.forEach(resourceCodes, (d) => {
        if (Array.isArray(fromData[d])) {
          fromData[d] = _.filter(fromData[d], (d2) => !d2.taskId)
        }
      })
      // 清空原表格字段的默认数据
      tableListStore.list.forEach((store) => {
        fromData[store.params.fieldCode] = []
      })

      // 问题 ： 字段有默认值，然后删除完以后为undefined，不会传给后端，这个时候在下一个环节的时候，还会有默认值
      _.forEach(fromData, (value, key) => {
        fromData[key] = value === undefined ? null : value
      })
      // version防止重复提交
      submitData = _.assign({}, data, {
        form: fromData,
        version: forms.version || null,
        ticketId: forms.ticketId
      })
    }
    if (type === 'hideSubmodel') {
      await ticketFieldJobStore.job_relate(submitData.subTicketId, submitData.subForm?.relatedJob) // 提交子流程作业数据，需要在提交工单前
    }
    // 在跳转 ， 提交 ， 完成 ， 子流程时需要进行表单数据的校验
    if (['jump', 'submit', 'finish', 'submodel', 'update'].indexOf(type) !== -1) {
      origin = _.omit(initForms, 'file')
      current = _.omit(fromData, 'file')
    } else if (type === 'conflict') {
      origin = _.omit(initForms, 'file')
      const oldFormData =
        this.details.current.ticketforms.current.props.form &&
        this.details.current.ticketforms.current.props.form.getFieldsValue()
      const newFormData = _.assign({}, oldFormData, fromData)
      current = _.omit(newFormData, 'file')
    }
    const conflictData = {
      ticketId: forms.ticketId,
      origin: origin,
      current: current,
      previousUser: type === 'conflict' ? this.state.updateUser.userId : null,
      tacheNo: Number(forms.tacheNo),
      tacheType: Number(forms.tacheType),
      tacheId: forms.tacheGroupId,
      isCountersign: Number(forms.isCountersign),
      updateTime: Number(this.state.cacheSaveTime || forms.updateTimgLong),
      actionType: getActionType(type)
    }

    const conflictResponse = await this.ticketStore.conflict(conflictData) // 返回的冲突信息
    if (!_.isEmpty(conflictResponse.changeList)) {
      // 有冲突时
      this.setState({
        visibleConflict: true,
        conflictResponse: conflictResponse,
        updateUser: conflictResponse.updateUser,
        message: data
      })
      if (type !== 'conflict') {
        this.setState({
          submitType: type
        })
      }
      return 'conflict'
    } else if (conflictResponse.isAllowed !== 1) {
      // 如果没冲突时，提交前判断自己是否在别的地方已提交过
      const actionTypeName = getActionTypeName(
        type,
        conflictResponse.conflictActionType,
        conflictResponse.updateUser.userName
      )
      message.warning(actionTypeName, 5)
      return 'conflict'
    } else {
      let result = ''
      let submitType = type
      if (type === 'conflict') {
        submitType = this.state.submitType
      }
      if (submitType === 'jump' || submitType === 'reassign') {
        submitData.caseId = this.state.formList.caseId
      }
      if (submitType === 'jump') {
        const { tacheId } = this.getQueryParamsFromLocation()
        submitData.tacheId = tacheId
        submitData.quickRollback = this.state.formList.quickRollback
      }
      // 创建子流程时带上子流程设计id
      if (type === 'submodel' || type === 'hideSubmodel') {
        const { ruleVos = [] } = this.state.activityData
        const ruleVo = ruleVos.find((item) => item.flowCode === flowCode)
        if (ruleVo) {
          options = { chartId: ruleVo.subChartId }
        }
      }

      const fieldCodes = _.keys(_.get(submitData, 'form'))

      // 处理 onrealsubmit 脚本
      try {
        await realSubmit(forms, submitData, type)
      } catch (e) {
        // message.error('onrealsubmit脚本返回了' + e.message)
        console.log('onrealsubmit脚本返回了' + e.message)
        return false
      }

      // 自定义字段的使用的钩子函数
      try {
        await this.props.loadFieldWidgetStore.submitWidgetsEvent(
          { flowCode, submitType: type, isCreateTicket: true, modelCode: forms.modelCode },
          fieldCodes
        )
      } catch (e) {
        widgetsEventError(
          _.get(this, 'details.current.ticketforms.current.props.form.setFields'),
          e
        )
        return false
      }

      const currentSubmitData = _.cloneDeep(submitData)
      if (submitType === 'reassign' || submitType === 'crossUnitReassign') {
        _.forIn(currentSubmitData?.form || [], (value, key) => {
          if (value === '*********') {
            delete currentSubmitData.form[key]
          }
        })
      }
      if (submitType === 'jump') {
        _.forIn(submitData?.form || [], (value, key) => {
          if (value === '*********') {
            delete submitData.form[key]
          }
        })
      }

      // 关联自动化任务
      const itemRelateJob = hasRelateJob(formList.formLayoutVos || [])
      const isHideRelateJob = getIsHideRelateJob()
      let autoPlanRes = null
      if (itemRelateJob && !isHideRelateJob) {
        autoPlanRes = await this.details?.current?.onSubmitAutoPlan()
        if (autoPlanRes && submitData) {
          submitData.form.execute_plan_data = autoPlanRes
          submitData.form.job_execute_step = 1
          currentSubmitData.form.execute_plan_data = autoPlanRes
          currentSubmitData.form.job_execute_step = 1
        }
      }

      if (itemRelateJob && autoPlanRes === false) {
        return false
      }
      switch (submitType) {
        case 'jump': // 跳转
        case 'submit':
          result = await this.ticketStore.ticketSubmit(submitData)
          break // 提交
        case 'crossUnitSubmit':
          result = await this.ticketStore.ticketCrossUnitSubmit(submitData)
          break // 跨租户提交
        case 'reassign':
          result = await this.ticketStore.ticketReassign(currentSubmitData)
          break // 改派
        case 'crossUnitReassign':
          result = await this.ticketStore.ticketCrossUnitReassign(currentSubmitData)
          break // 跨租户改派
        case 'remoteTicket':
          // 远程工单提交前更新工单数据
          await this.ticketStore.ticketUpdate(updateData)
          result = await this.ticketStore.createRemoteTicket(submitData)
          break // 远程工单
        case 'complete':
          result = await this.ticketStore.ticketComplete(submitData)
          break // 完成
        case 'submodel':
        case 'hideSubmodel':
          result = await this.ticketStore.createSubProcess(submitData, options)
          break // 子流程手动建单
        case 'rollBack':
          result = await this.ticketStore.ticketRollback(submitData, options)
          break // 回退
        case 'remote_roll_back':
          result = await this.ticketStore.ticketRemoteRollback(submitData)
          break
        case 'remote_submit':
          result = await this.ticketStore.ticketRemoteRolledSubmit(submitData)
          break
        case 'abolish':
          result = await this.ticketStore.ticketAbolish(submitData)
          break // 废除
        case 'close':
          result = await this.ticketStore.ticketClose(submitData)
          break // 关闭
        case 'reopen':
          result = await this.ticketStore.ticketReopen(forms.ticketId, submitData)
          break // 重开
        case 'retrieve':
          result = await this.ticketStore.ticketRetrieve({
            ticketId: forms.ticketId,
            tacheId: forms.tacheId,
            version: forms.version || null,
            content: submitData ? submitData.content : undefined
          })
          break // 取回
        case 'save':
          result = await this.ticketStore.ticketSave(forms.modelId, submitData)
          break // 保存
        case 'update':
          result = await this.ticketStore.ticketUpdate(submitData)
          break // 更新
        case 'receive': // 接单
          // version防止重复接单
          const params = _.pick(forms, [
            'ticketId',
            'tacheNo',
            'tacheType',
            'tacheId',
            'caseId',
            'version'
          ])
          result = await ticketStore.ticketReceive(params)
          break
        case 'retrieveRemoteTicket':
          result = await this.ticketStore.retrieveRemoteTicket(
            forms.ticketId,
            forms.caseId,
            submitData
          )
          break
        default:
          break
      }

      if (result) {
        // 创建成功以后给iframe控件发送信息
        communication(this.state.formList.formLayoutVos, type, 0)
        // 刷新左边的数据
        this.lefRefresh()

        this.onValuesChange(false)

        if (type === 'update') {
          // 更新 表单数据后 刷新 处理记录、tab数据数量统计
          this.ticketStore.getTicketDetailTabCounts(forms.ticketId)
          this.ticketStore.getProcessRecord(forms.ticketId, undefined, forms.caseId)
        }
        if (this.props.afterSubmitAction) {
          this.props.afterSubmitAction(submitType)
          //ticketMove接口返回数据格式变了，之前返回的data是null，现在返回的是对象，需要用result返回的对象，但是要保留之前的result:'submit'
          if (submitType === 'jump') {
            return 'submit'
          }
          return result
        }
        if (!_.includes(['save', 'update', 'receive'], submitType)) {
          const { ticketSource, hideHeader, hideHead, hideMenu, appkey } =
            this.getQueryParamsFromLocation()
          if (ticketSource) {
            const urlSearch = new URLSearchParams(this.props.location?.search || '')
            if (window.parent !== window) {
              window.parent.postMessage({ createTicket: 'success', nextTacheData: result }, '*')
            } else if (urlSearch.get('isPostMessage')) {
              window.postMessage({ createTicket: 'success', nextTacheData: result }, '*')
            } else {
              const url = `/ticketDetail/${forms.ticketId}?ticketSource=${ticketSource}&hideHeader=${hideHeader}&hideHead=${hideHead}&hideMenu=${hideMenu}`
              // 兼容低代码那边新开页面的查看详情
              if (ticketSource === 'lowcode' && appkey) {
                this.props.history.replace(`${url}&appkey=${appkey}`)
              } else {
                this.props.history.replace(url)
              }
              window.location.reload()
            }
          } else {
            this.successJump(submitData)
          }
        }
      } else {
        // 失败
        try {
          await this.props.loadFieldWidgetStore.cancelWidgetsEvent(fieldCodes)
        } catch (e) {
          widgetsEventError(
            _.get(this, 'details.current.ticketforms.current.props.form.setFields'),
            e
          )
        }
      }
      //ticketMove接口返回数据格式变了，之前返回的data是null，现在返回的是对象，需要用result返回的对象，但是要保留之前的result:'submit'
      if (submitType === 'jump') {
        return 'submit'
      }
      return result
    }
  }

  // 点击按钮成功后的页面跳转回调
  successJump = (submitData) => {
    if (window.location.pathname.indexOf('/ticket.html') !== -1) {
      localStorage.setItem('RELOAD_TICKET_LIST', new Date().getTime())
      const close = setTimeout(() => {
        window.close()
      }, 3000)
      Modal.success({
        title: `${submitData && submitData.form ? submitData.form.title : ''}${i18n(
          'ticket.detail.handleSuccess',
          ' 处理成功'
        )}`,
        content: '本页面将在3S后关闭',
        okText: '立即关闭',
        onOk: () => {
          clearInterval(close)
          window.close()
        }
      })
    } else {
      message.success(
        `${submitData && submitData.form ? submitData.form.title : ''}${i18n(
          'ticket.detail.handleSuccess',
          ' 处理成功'
        )}`
      )
      this.props.history.replace(getPerUrl(listStore.filterType))
    }
  }

  // 工单左侧刷新
  lefRefresh = () => {
    this.props.globalStore.getFilterType()
  }

  // 点击按钮以后进行校验
  validate = async (fn, item) => {
    try {
      const res = await this.details.current.validateFieldsValue(item)
      if (item?.action === 'jump') {
        // 如果有《新建协办单》按钮需要判断是否建了协办单
        const hasXiebandan = await this.checkXieBanDan()
        if (!hasXiebandan) {
          const isremindNoCoOrder = await this.props.globalStore.getTicketIsRemind()
          if (isremindNoCoOrder) {
            Modal.confirm({
              title: i18n('globe.confirm', '确认提示'),
              content: i18n('xiebandanTip', '暂未发起协办单，确认提交？'),
              onOk: () => {
                fn(res, true)
              },
              onCancel: () => {
                fn(null, false)
              }
            })
          } else {
            fn(res, true)
          }
        } else {
          fn(res, true)
        }
      } else {
        fn(res)
      }
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  // 冲突弹框取消
  conflictModalCancel = () => {
    this.setState({ visibleConflict: false })
  }

  // 关闭KB的侧滑弹框
  closeModal = (flag) => {
    this.setState({
      iframeVisible: false,
      iframeSrc: '',
      iframeType: ''
    })
  }

  // 对接kb，进行工单转知识
  handleOperationClick = async (type) => {
    const forms = mobx.toJS(this.ticketStore.detailForms)
    const isIframe = window.location.href.includes('/ticketDetail/')
    if (type === 'copy') {
      const formData = this.details.current.ticketforms.current.props.form.getFieldsValue()
      _.forIn(formData, (value, key) => {
        if (value === '*********') {
          formData[key] = undefined
        }
      })
      window.TICKET_COPY_DATA = formData
      let url = `/ticket/createTicket/${forms.modelId}`
      if (isIframe) {
        url += '?hideHeader=1'
      }
      this.props.history.push({
        pathname: url,
        search: `?isCopy=true&copyTicketId=${forms.ticketId}`
      })
    }
    if (type === 'search') {
      const title = this.details.current.ticketforms.current.props.form.getFieldValue('title')
      this.setState({
        iframeVisible: true,
        iframeSrc: `/kb/search.html#/?outsideKeyword=${title}`,
        iframeType: type
      })
    }
    if (type === 'create') {
      const formData = this.details.current.ticketforms.current.props.form.getFieldsValue()
      const data = {
        form: formData,
        ticketId: forms.ticketId
      }
      try {
        // 如果工单转知识失败的话不弹框
        const kbResponse = await this.ticketStore.ticketToKB(data)
        const createData = _.cloneDeep(kbResponse)
        createData.resourceId = forms.ticketId
        createData.attachements = _.map(kbResponse.attachements, (item) => {
          return {
            contentType: item.contentType,
            length: item.length,
            uid: item.id,
            url: item.filePath,
            name: item.name
          }
        })

        this.setState({
          iframeVisible: true,
          iframeSrc: '/kb/new.html',
          iframeType: type,
          createData: createData
        })
      } catch (e) {}
    }
    if (type === 'detail') {
      this.setState({
        iframeVisible: true,
        iframeSrc: `/kb/knowledge.html#/itsm/${forms.ticketId}`,
        iframeType: type
      })
    }
  }

  onValuesChange = (leaveNotify) => {
    this.props._handleChangeLeaveNotify(leaveNotify)
  }

  // 获取form中codes的value , 高阶组件 removeSideEffect 使用
  getFormCodesValue = (type) => {
    let fields = []
    _.forEach(this.state.formList.formLayoutVos, (d) => {
      if (d.type === 'group') {
        fields = [...d.fieldList, ...fields]
      } else {
        _.forEach(d.tabs, (tab) => {
          fields = [...fields, ...tab.fieldList]
        })
      }
    })
    const codes = getFieldsCode(fields, type, 'code')
    const current = this.current?.getFieldsValue(codes)
    return current
  }

  getActivityById = (data, cb) => {
    axios.post(API.GET_ACTIVITY_BY_ID, data).then((data) => {
      cb && cb(data)
      this.setState({
        activityData: data
      })
    })
  }

  setBtnCanClick = (btnCanClick) => {
    this.setState({ btnCanClick })
  }

  render() {
    const queryParams = this.getQueryParamsFromLocation()
    const { inContainer, afterSubmitAction } = this.props
    const { ticketComment, isComment, detailForms, retryJobStatus } = this.ticketStore
    const {
      message,
      visibleConflict,
      conflictResponse,
      createData,
      iframeVisible,
      iframeSrc,
      iframeType,
      loading,
      formList,
      btnCanClick,
      serviceData,
      olaAndSlaInfo,
      jobList
    } = this.state
    // 此属性用来判断是否有编辑权限
    // 是否是当前处理人
    const isCurrentExecutor =
      (formList.currexcutor || '').indexOf(runtimeStore.getState().user?.userId) !== -1
    const dilver = {
      btnCanClick,
      loading,
      queryParams,
      detailForms,
      type: 'detail',
      forms: formList,
      retryJobStatus, // 重试作业（让挂起工单可以编辑， 并出现更新、改派、回退按钮）
      validate: this.validate, // 工单校验
      handleOk: this.handleOk, // 工单提交
      lefRefresh: this.lefRefresh,
      onValuesChange: this.onValuesChange,
      setBtnCanClick: this.setBtnCanClick,
      ticketSource: queryParams.ticketSource,
      getAgainDetailForms: this.getAgainDetailForms,
      disabled: retryJobStatus ? false : !(formList.status === 2 && isCurrentExecutor),
      afterSubmitAction
    }
    const isNewTab = window.location.href.includes('ticket.html')
    return (
      <Provider
        ticketStore={this.ticketStore}
        createStore={createStore}
        resourceStore={resourceStore}
        processListStore={processListStore}
        ticketFieldJobStore={ticketFieldJobStore}
        userStore={userStore}
      >
        <div
          className={classnames('clearfix', {
            'ticket-detail-wrap': !inContainer,
            'ticket-detail-wrap-inContainer': inContainer,
            iframe: queryParams.ticketSource,
            'form-wrap-content': true
          })}
        >
          {!inContainer && <PageHeader isNewTab={isNewTab} />}
          <ContentLayout>
            <div className="head-form-wrap">
              {formList.ticketId && (
                <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                  <Head
                    {...dilver}
                    autoJobInfo={this.state.autoJobInfo}
                    getActivityById={this.getActivityById}
                    handleClick={this.handleOperationClick}
                    getDetailForms={this.getDetailForms}
                    getFieldValue={_.get(
                      this,
                      'details.current.ticketforms.current.props.form.getFieldValue'
                    )}
                    getFieldsValue={_.get(
                      this,
                      'details.current.ticketforms.current.props.form.getFieldsValue'
                    )}
                    handleJobDetail={() => this.handleJobDetail()}
                    search={this.props?.location?.search || ''}
                  />
                </ErrorBoundary>
              )}
            </div>
            <div className="form-body-content-wrap">
              {/* {formList.formMode !== 'new' &&
              formList.ticketId &&
              Array.isArray(formList.modelStageVoList) &&
              formList.modelStageVoList.length > 0 && (
                <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                  <Step
                    stageList={formList.modelStageVoList}
                    activeStep={formList.activityStageCode}
                  />
                </ErrorBoundary>
              )} */}

              {formList.formMode !== 'new' && formList.ticketId && (
                <ErrorBoundary desc={i18n('loadFail', '加载失败')}>
                  {isComment?.fromSrv && isComment?.isFinish && ticketComment.length > 0 && (
                    <CommentDetail record={ticketComment[0]} />
                  )}
                  <DetailList
                    formList={this.state.formList}
                    serviceData={serviceData}
                    olaAndSlaInfo={olaAndSlaInfo}
                  />
                </ErrorBoundary>
              )}
              {formList.formMode !== 'new' && formList.ticketId ? (
                <DetailTabs
                  {...dilver}
                  {...this.props}
                  ref={this.details}
                  jobList={jobList}
                  getDetailForms={this.getDetailForms}
                  getCurrentTicketValue={() => {
                    return (
                      this.details.current &&
                      this.details.current.ticketforms.current.props.form &&
                      this.details.current.ticketforms.current.props.form.getFieldsValue()
                    )
                  }}
                />
              ) : (
                <Spin spinning={loading}>
                  <Forms
                    {...dilver}
                    {...this.props}
                    ref={this.details}
                    jobList={jobList}
                    id={formList.ticketId}
                    getDetailForms={this.getDetailForms}
                    executeStep={planExecuteStep(formList?.formLayoutVos)}
                    startNode={false}
                    relateTicketList={ticketStore.relateTicket}
                    relateSubProcessTickets={mobx.toJS(ticketStore.relateSubProcessTickets)}
                    olaAndSlaInfo={olaAndSlaInfo}
                    getCurrentTicketValue={() => {
                      return (
                        this.details.current &&
                        this.details.current.ticketforms.current.props.form &&
                        this.details.current.ticketforms.current.props.form.getFieldsValue()
                      )
                    }}
                  />
                </Spin>
              )}
            </div>

            {visibleConflict && (
              <Conflict
                visible={visibleConflict}
                message={message}
                conflictResponse={conflictResponse}
                handleOk={this.handleOk}
                conflictModalCancel={this.conflictModalCancel}
              />
            )}

            {!loading && (
              <KB
                data={createData}
                onClose={this.closeModal}
                visible={iframeVisible}
                src={iframeSrc}
                type={iframeType}
              />
            )}
          </ContentLayout>
        </div>
      </Provider>
    )
  }
}

export default inject(
  'globalStore',
  'loadFieldWidgetStore'
)(removeSideEffect(observer(Details), { resourceStore, ticketFieldJobStore }))
