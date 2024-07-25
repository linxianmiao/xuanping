import { observable, action, runInAction, computed } from 'mobx'
import { qs } from '@uyun/utils'
import setProps from '~/utils/setProps'
import { attributeRelate } from '~/list/config/attribute'

// 详情关联工单默认列
const defaultAttributeList = [
  'title',
  'ticketNum',
  'ticketRelationType',
  'modelName',
  'activityName',
  'status',
  'executorAndGroup'
]
export default class CreateStore {
  @observable detailForms = {}

  // 工单信息
  @observable initializeForms = {}

  // 初始化数据用于工单冲突使用
  @observable visible = false

  // 工单处理弹框
  @observable mode = 0

  // 图模式
  @observable processList = []

  // 流程图
  @observable SLAList = []

  // sla信息
  @observable isKB = false

  // ola信息
  @observable OLAList = []

  // 是否可以进行工单转知识
  @observable approve = 0

  // 检测 是否 有 审阅 操作
  @observable logList = []

  @observable endRangeTime = undefined

  // 处理记录列表
  @observable commentList = []

  // 关联工单
  @observable relateTicket = []

  @observable relateTicketLoading = false

  @observable mergeTicket = []

  @observable mergeTicketPagination = {
    current: 1,
    pageSize: 15,
    total: 0
  }

  // 评论列表
  @observable recordList = []

  @observable processRecordLoading = false
  @observable relateSubProcessTickets = [] // 关联子流程任务列表，提交时必填校验用

  hasMoreProcessRecord = true

  processRecordParams = {
    pageNum: 1,
    pageSize: 15
  }

  // 当前展示的处理记录列表
  @observable processSelected = ''

  // 默认选中 全部 记录列表(选择不同阶段的处理记录)
  @observable permission = false

  // 是否有cmdb权限
  @observable nextActivity = {}

  @observable userInfos = []

  @observable activity = {}

  /// 关联工单用
  @observable serviceData = {}

  // 创建关联用单用
  @observable createRelateTicekt = {}

  // 是否只显示有处理意见的处理意见
  @observable onlyShowAdvice = false

  // 工单详情tab页数据的数量统计
  @observable tabCounts = {}

  // 重试作业（让挂起工单可以编辑， 并出现更新、改派、回退按钮）
  @observable retryJobStatus = false

  // 关联工单定制列
  @observable.ref relateAttributeList = defaultAttributeList
  @observable.ref relateTicketAttributeList = {} // 定制列的工单列表信息
  @observable.ref columnAttrListRelate = attributeRelate
  @observable.ref columnSelectedListRelate = attributeRelate

  // 远程工单的列表
  @observable remoteTicketList = []
  @observable remoteTicketsLoading = false
  @observable remotePagination = {
    current: 1,
    size: 10,
    total: 1
  }
  //详情页的按钮
  @observable.ref restrictBtns = undefined

  @action setRelateSubProcessTickets(arr) {
    runInAction(() => {
      this.relateSubProcessTickets = arr
    })
  }

  // 关联工单定制列
  // 设置已选中的值
  @action setSelectedList(list, type) {
    if (type === 'RELATE') {
      // 关联工单
      runInAction(() => {
        this.columnSelectedListRelate = list
      })
    }
  }

  @action resetRestrictBtns = () => {
    runInAction(() => {
      this.restrictBtns = undefined
    })
  }

  // @action async queryFieldInfo(codes, column) {
  //   const res = await axios.get(API.queryFieldDetailsByCodes, {
  //     params: { codes: _.uniq(codes).join() }
  //   })
  //   const columnListAll = _.cloneDeep(_.concat([], [...toJS(this.columnAttrList)], res))
  //   const columnList = getList(column, columnListAll)
  //   console.log('columnList', columnList)
  //   runInAction(() => {
  //     this.columnSelectedListRelate = columnList.filter((item) => item.name)
  //   })
  // }

  @action.bound setRelateAttributeList(relateAttributeList = defaultAttributeList) {
    this.relateAttributeList = relateAttributeList
  }

  @action async getTicketFormData(caseIds, codes) {
    if (caseIds.length === 0) return false
    const res = await axios.get(API.getTicketFormData, {
      params: { caseIds: caseIds.toString(), codes: codes.toString() }
    })
    if (!_.isEmpty(res)) {
      runInAction(() => {
        this.relateTicketAttributeList = res
      })
    }
  }

  @computed get ticketcolumns() {
    const caseIds = _.map(this.relateTicket, (ticket) => ticket.caseId)
    const codes = _.map(this.columnSelectedListRelate, (item) => {
      return item.modelId ? `${item.modelId}_${item.code}` : item.code
    })
    return { codes, caseIds }
  }

  @action setData(data) {
    this.createRelateTicekt = data
  }

  @action setProps = setProps(this)

  @action distory() {
    this.detailForms = {} // 工单信息
    this.initializeForms = {} // 初始化数据用于工单冲突使用
    this.visible = false // 工单处理弹框
    this.mode = 0 // 图模式
    this.processList = [] // 流程图
    this.SLAList = [] // sla信息
    this.isKB = false // 是否可以进行工单转知识
    this.approve = 0 // 检测 是否 有 审阅 操作
    this.logList = [] // 处理记录列表
    this.relateTicket = [] // 关联工单
    this.recordList = [] // 当前展示的处理记录列表
    this.processSelected = '' // 默认选中 全部 记录列表(选择不同阶段的处理记录)
    this.commentList = [] // 评论列表
    this.onlyShowAdvice = false
    this.hasMoreProcessRecord = true
    this.processRecordParams = { pageNum: 1, pageSize: 15 }
    this.isComment = {}
    this.ticketComment = []
    this.retryJobStatus = false
    this.endRangeTime = undefined
  }

  // 获取详情tab页数据的数量统计
  @action async getTicketDetailTabCounts(ticketId) {
    const res = await axios.get(API.getDetailTabRecordCount, { params: { ticketId } })

    runInAction(() => {
      this.tabCounts = res || {}
    })
  }

  // 获取工单详情
  @action async getTicketDetail(ticket, isDrafts) {
    const ticketData =
      (await axios({
        url: API.TICKETDETAIL(ticket.ticketId),
        method: 'get',
        params: {
          tacheNo: ticket.tacheNo,
          tacheType: ticket.tacheType,
          tacheId: ticket.tacheId,
          caseId: ticket.caseId
        }
      })) || {}

    let draftsData = null
    if (isDrafts === 'true') {
      draftsData = await axios.get(API.GETTICKETCACHE(ticket.ticketId), {
        params: { tacheId: ticket.tacheId }
      })
    }

    if (draftsData) {
      _.forEach(ticketData.formLayoutVos, (item) => {
        if (item.type === 'group') {
          _.forEach(item.fieldList, (field) => {
            _.forEach(draftsData.fieldCraftVos, (item) => {
              if (field.code === item.code) {
                field.defaultValue = item.value
              }
            })
          })
        } else {
          _.forEach(item.tabs, (tab) => {
            _.forEach(tab.fieldList, (field) => {
              _.forEach(draftsData.fieldCraftVos, (item) => {
                if (field.code === item.code) {
                  field.defaultValue = item.value
                }
              })
            })
          })
        }
      })
    }
    runInAction(() => {
      this.detailForms = ticketData
    })
    return ticketData
  }

  // 清空流程图数据
  @action clearFlowChart() {
    this.processList = []
  }

  // 获取服务详情
  @action async getTicketSrvcat(ticketId) {
    const res = (await axios.get(API.GETTICKETSERVICE, { params: { id: ticketId } })) || {}
    runInAction(() => {
      this.serviceData = res
    })
    return res
  }

  // 获取流程图
  @action getFlowChart(data) {
    axios({
      url: API.GET_FLOW_CHART,
      method: 'get',
      params: data,
      paramsSerializer: (params) => qs.stringify(params, { indices: false })
    }).then(({ mode, data }) => {
      this.processList = data
      this.mode = mode
    })
  }

  // 获取SLA详情
  @action getSLAList(id) {
    axios.get(API.GET_TICKET_SLA_LIST, { params: { ticketId: id } }).then((data) => {
      this.SLAList = data || []
    })
  }

  // 获取OLA详情
  @action getOLAList(id) {
    axios.get(API.GET_TICKET_OLA_LIST, { params: { ticketId: id } }).then((data) => {
      this.OLAList = data || []
    })
  }

  // 获取已经关联的工单列表
  @action getRelateTicket = (id) => {
    this.relateTicketLoading = true

    axios.get(API.GET_RELATE_TICKET, { params: { ticketId: id } }).then((data) => {
      this.relateTicket = data === '200' ? [] : data
      this.tabCounts.relateTicketTotal = this.relateTicket.length
      this.relateTicketLoading = false
    })
  }

  // 关联工单
  @action submitRelateTicket = (data) => {
    // const data = {
    //   srcId: id,
    //   destId: selectedRowKeys.join(','),
    //   relationType: '5'
    // }
    axios.get(API.RELATE_TICKET, { params: data }).then(() => {
      // this.props.ticketStore.getTicketDetailTabCounts(id) // 关联后 刷新tab数据数量统计
      // this.props.ticketStore.getProcessRecord(id, undefined, this.props.formList.caseId) // 关联后 刷新处理记录
      // this.getMergeTicket({ ticketId: id })
      // this.setState({
      //   selectedRowKeys: [],
      //   wd: '',
      //   visible: false
      // })
    })
  }

  // 获取已经合并的工单列表
  @action getMergeTicket = (data) => {
    const { current, pageSize } = this.mergeTicketPagination
    const params = { type: 5, pageNum: current, pageSize }
    const newData = _.assign(params, data)
    axios.get(API.queryMergeTickets, { params: newData }).then((data) => {
      this.mergeTicket = data.list || []
      this.mergeTicketPagination = {
        ...this.mergeTicketPagination,
        total: data.count || 0,
        current: data.pageNum || this.mergeTicketPagination.current,
        pageSize: data.pageSize || this.mergeTicketPagination.pageSize
      }
      this.tabCounts.mergeTicketTotal = data.count
    })
  }

  @action getCommentList = (id) => {
    axios.get(API.COMMENT(id)).then((data) => {
      this.commentList = data
    })
  }

  // 编辑工单弹框
  @action EidtTicket(visible) {
    this.visible = visible
  }

  // 工单保存
  @action ticketSave(id, data) {
    return new Promise((resolve) => {
      axios.post(API.SAVETICKETCACHE(id), data).then((res) => {
        if (res === '200') {
          resolve('save')
        }
      })
    })
  }

  // 工单提交
  @action ticketSubmit(data) {
    const url = data.quickRollback ? API.quicklyResumeTicket : API.TICKET_MOVE
    const body = data.quickRollback
      ? {
          caseId: data.caseId,
          ticketId: data.ticketId,
          currentActivityId: data.tacheId,
          form: data.form,
          message: data.message,
          version: data.version
        }
      : data

    return new Promise((resolve) => {
      axios.post(url, body).then((res) => {
        if (data.quickRollback && res === '200') {
          resolve('submit')
        } else {
          !_.isEmpty(res) && resolve(res)
        }
      })
    })
  }

  // 跨租户提交
  @action ticketCrossUnitSubmit(data) {
    return new Promise((resolve) => {
      axios.post(API.commitWithCrossUnit, data).then((res) => {
        res === '200' && resolve('crossUnitSubmit')
      })
    })
  }

  // 远程工单
  @action createRemoteTicket(data) {
    return new Promise((resolve) => {
      axios.post(API.createRemoteTicket, data).then((res) => {
        res === '200' && resolve('remoteTicket')
      })
    })
  }

  // 工单改派
  @action ticketReassign(data) {
    return new Promise((resolve) => {
      axios.post(API.TICKET_REAGGIGN, data).then((res) => {
        res === '200' && resolve('reassign')
      })
    })
  }

  // 跨租户改派
  @action ticketCrossUnitReassign(data) {
    return new Promise((resolve) => {
      axios.post(API.reassignWithCrossUnit, data).then((res) => {
        res === '200' && resolve('crossUnitReassign')
      })
    })
  }

  // 工单完成
  @action ticketComplete(data) {
    return new Promise((resolve) => {
      axios.post(API.COMPLETETICKET, data).then((res) => {
        // 高钊个坑逼，返回了一个true
        res && resolve('complete')
      })
    })
  }

  // 发起子流程
  @action ticketSubmodel(data) {
    return new Promise((resolve) => {
      axios.post(API.CREATE_SUBMODEL, data).then((res) => {
        res === '200' && resolve('submodel')
      })
    })
  }

  // 发起子流程 手动建单
  @action createSubProcess(data, options = {}) {
    return new Promise((resolve) => {
      const autoCreateTicket = data.autoCreateTicket
      delete data.autoCreateTicket
      axios({
        method: 'post', // 方法
        url: API.createSubProcess, // 地址
        data: data,
        params: {
          needSuspend: data.needSuspend,
          autoCreateTicket: autoCreateTicket,
          chartId: options.chartId
        }
      }).then((res) => {
        if (res === '200') {
          resolve('submodel')
        }
      })
    })
  }

  // 工单回退
  @action ticketRollback(data, options) {
    const { rollbackWay, message } = data
    const { rollbackResumeType, caseId } = options
    const isQuicklyRollback = (rollbackWay === 1 || rollbackWay === 2) && rollbackResumeType === 1
    const url = isQuicklyRollback ? API.quicklyRollbackTicket : API.ROLL_BACK
    const body = isQuicklyRollback
      ? {
          currentActivityId: data.tacheId,
          rollbackActivityId: data.targetActivityId,
          ticketId: data.ticketId,
          caseId,
          message
        }
      : data

    return new Promise((resolve) => {
      axios.post(url, body).then((res) => {
        res === '200' && resolve('rollback')
      })
    })
  }

  // 远程工单回退
  @action ticketRemoteRollback(data) {
    return new Promise((resolve) => {
      axios.post(API.remoteTicketRollback, data).then((res) => {
        res === '200' && resolve('remote_roll_back')
      })
    })
  }

  // 远程回退回来的工单提交
  @action ticketRemoteRolledSubmit(data) {
    return new Promise((resolve) => {
      axios.post(API.remoteTicketRolledSubmit, data).then((res) => {
        res === '200' && resolve('remote_submit')
      })
    })
  }

  // 工单废除
  @action ticketAbolish(data) {
    return new Promise((resolve) => {
      axios.post(API.DELETE_TICKET, data).then((res) => {
        res === '200' && resolve('abolish')
      })
    })
  }

  // 工单关闭
  @action ticketClose(data) {
    return new Promise((resolve) => {
      axios.post(API.CLOSETICKET, data).then((res) => {
        res === '200' && resolve('close')
      })
    })
  }

  // 工单重开
  @action ticketReopen(id, data = {}) {
    return new Promise((resolve) => {
      axios.get(API.REOPEN(id), { params: { content: data.content } }).then((res) => {
        res === '200' && resolve('reopen')
      })
    })
  }

  // 工单取回
  @action ticketRetrieve(params) {
    return new Promise((resolve) => {
      axios.post(API.RETRIEVE, params).then((res) => {
        res === '200' && resolve('retrieve')
      })
    })
  }

  // 接单
  @action ticketReceive({ ticketId, tacheNo, tacheType, tacheId, caseId, version = null }) {
    return new Promise((resolve) => {
      axios({
        url: API.RECEIVTICKET(ticketId),
        method: 'POST',
        params: {
          tacheNo,
          tacheType,
          tacheId,
          caseId,
          version
        }
      }).then((data) => {
        data === '200' && resolve('receive')
        data !== '200' && resolve(data)
      })
    })
  }

  @action ticketUpdate(data) {
    return new Promise((resolve) => {
      axios.post(API.ticket_update, data).then((res) => {
        res === '200' && resolve('update')
      })
    })
  }

  // 冲突检测
  @action conflict(data) {
    return new Promise((resolve) => {
      axios.post(API.CONFLICT, data).then((data) => {
        resolve(data)
      })
    })
  }

  // 工单关注
  @action ticketAttention(ticketId, isAttention, processId) {
    return axios({
      method: 'post',
      url: API.attentionTicket(ticketId, isAttention, processId)
    })
  }

  // 对接KB
  @action ticketToKB(data) {
    return axios.post(API.TICKET_TRANSFORM_KB, data)
  }

  // 获取 处理记录
  @action getProcessRecord(id, params = { pageNum: 1, pageSize: 15 }, caseId) {
    this.processRecordLoading = true
    let param = {
      ...params,
      caseId
    }
    if (this.endRangeTime) {
      param.endRangeTime = this.endRangeTime
    }
    return axios.get(API.GET_OPERATE_RECORD(id), { params: param }).then((res) => {
      runInAction(() => {
        res = res || {}
        const { processRecord = [], userInfos = [] } = res

        if (!_.isEmpty(processRecord) && Array.isArray(processRecord)) {
          const exectorTime = processRecord[processRecord.length - 1]?.exectorTime
          this.endRangeTime = !_.isEmpty(exectorTime) ? new Date(exectorTime).getTime() : undefined
        }
        this.logList = (params.pageNum > 1 ? this.logList : []).concat(processRecord)
        this.recordList = (params.pageNum > 1 ? this.recordList : []).concat(processRecord)
        this.userInfos = _.uniqBy(
          (params.pageNum > 1 ? this.userInfos : []).concat(userInfos),
          'userId'
        )
        this.processSelected = ''
        this.processRecordLoading = false
        this.processRecordParams = params

        if (processRecord.length < params.pageSize) {
          this.hasMoreProcessRecord = false
        } else {
          this.hasMoreProcessRecord = true
        }
      })

      return res
    })
  }

  // 选择不同阶段的 处理记录
  @action selectProcessRecord(val) {
    if (val) {
      this.recordList = this.logList.filter((item) => item.activityName === val)
      this.processSelected = val
    } else {
      this.recordList = this.logList
      this.processSelected = ''
    }
  }

  // 提交 已审阅
  @action saveApprove(data) {
    return new Promise((resolve) => {
      axios.post(API.SAVE_APPROVE, data).then((res) => {
        res === '200' && resolve('approved')
        data !== '200' && resolve(res)
      })
    })
  }

  // 检测kb是否可用
  @action async isGenerateKB(id) {
    const res = await axios.get(API.isGenerateKB(id))
    return res
  }

  // 催办
  @action ticketReminder(data, callback) {
    axios.post(API.reminderTicket, data).then((res) => {
      if (res === '200') {
        callback()
      }
      if (+res === 3370) {
        callback('notAllow')
      }
    })
  }

  // 挂起恢复
  @action ticketSuspendAndResume(data, callback) {
    axios
      .get(API.suspendAndResume, {
        params: {
          ticketId: data.ticketId,
          isSuspend: data.isSuspend,
          caseId: data.caseId,
          content: data.content
        }
      })
      .then((res) => {
        if (res === true) {
          callback()
        }
      })
  }

  // 加签
  @action
  async handleTicketEndorsement(value) {
    const res = await axios.post(API.addDynamicNode, value)
    return res
  }

  @action async getCurrentActivity(data) {
    runInAction(() => {
      this.activity = data
    })
  }

  @action async findAndModify(data) {
    const res = await axios({
      method: 'post',
      url: API.findAndModify,
      params: data
    })
    return res
  }

  // 自动交付节点出现问题后，刷新重试
  @action async retryJob(data) {
    const res = await axios({
      method: 'post',
      url: API.retryJob,
      params: data
    })
    return res
  }

  // 自动交付节点更新按钮点击状态,用于工单详情页的按钮是否显示
  @action async updateExecutionResult(data) {
    const res = await axios.post(API.updateExecutionResult, data)
    return res
  }

  // 工单评论
  @observable
  ticketComment = []

  @observable
  isComment = {}

  @action
  async isTicketComment(ticketId) {
    const res = await axios.get(API.isComment(ticketId))
    runInAction(() => {
      this.isComment = res
    })
    if (res?.hasComment) {
      this.getComment(ticketId)
    }
    return res
  }

  @action
  async getComment(ticketId) {
    const res = await axios.get(API.ticketComment(ticketId))
    runInAction(() => {
      this.ticketComment = res
    })
    return res
  }

  @action
  async commentSave(params) {
    const res = await axios.post(API.ticketCommentSave, params)
    this.getComment(params.ticketId)
    return res
  }

  @action
  getRemoteTiekets = async (ticketId, pageNo, pageSize) => {
    this.remoteTicketsLoading = true
    const res = await axios.get(API.queryRemoteTicketList(ticketId, pageNo, pageSize))
    runInAction(() => {
      this.remotePagination = {
        current: pageNo,
        size: pageSize,
        total: res.total
      }
      this.remoteTicketList = res.list
      this.remoteTicketsLoading = false
    })
  }

  @action
  finishAssitTicket = async (params) => {
    await axios.post(API.finishAssistTicket, params)
  }

  @action
  checkXiebandan = async (params) => {
    const { ticketId, relationType, relationScope } = params
    return await axios.get(API.checkRelationTicketCount(ticketId, relationType, relationScope))
  }

  @action
  remoteConfirm = async (params) => {
    const res = await axios.post(API.confirmPass, params)
    return res
  }

  // 跨系统远程节点撤回
  @action
  retrieveRemoteTicket = async (ticketId, caseId, params) => {
    const res = await axios.post(API.retrieveRemoteTicket(ticketId, caseId), params)
    return res
  }

  //获取限制的按钮列表
  @action
  getRestrictBtns = async (ticketId, tacheId) => {
    const res =
      (await axios.get(API.getTicketRestrictBtns, { params: { ticketId, tacheId } })) || {}
    runInAction(() => {
      this.restrictBtns = res.operateRestrictList
    })
  }
}
