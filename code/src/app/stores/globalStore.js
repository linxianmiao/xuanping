import { action, runInAction, observable } from 'mobx'
import { store as runtimeStore } from '@uyun/runtime-react'
import { getPriorityList } from '~/components/ColorPicker/logic'
class Global {
  @observable draftsTotal = 0

  @observable.ref ticketFilterType = {} // 工单数量

  @observable.ref productPermissions = []

  @observable.ref configAuthor = {} // itsm侧边栏权限

  @observable.ref ticketListOperation = {} // 所有工单操作权限

  @observable.ref menuList = {}

  @observable filterNamesByRegular = false // true时校验

  @observable routePermissions = {
    isShowBatch: false, // 是否有批量处理的权限
    hasChangeAuth: false // 是否有修改已完成工单的权限
  }

  @observable.ref productNum = {
    ufs: 0,
    cmdb: 0,
    asset: 0,
    automation: 0
  }

  // 其他联调产品权限
  // 左侧列表
  @observable defaultHome = '' // 默认首页

  @observable token = ''

  @observable openType = ['1', '0'] // 创建工单入口

  // 工单查询视图
  @observable ticketQueryViews = {}

  @observable grantedApp = {} // 授权的产品

  @observable showStatusButton = false // 模型是否不需要审批,false需要

  @observable fileAccept = null // 附件上传支持的文件类型

  @observable approveCount = 0 // 待审阅工单数量

  @observable relate_job = false // 关联作业字段采用老版(false)还是新版(true)

  @observable ticketRecord = {} // 每条工单详情，面板屑需要工单名称和流水号

  @observable priorityList = getPriorityList() // 优先级

  @observable entrustTicketCount = 0

  @observable recentlyRemindTicketTime = 0

  // 获取token
  @action async getToken() {
    const res = await axios.get('/tenant/api/v1/user/details/token')
    runInAction(() => {
      this.token = res
    })
  }

  // 获取草稿数量
  @action async getDraftsTotal() {
    const res = (await axios.get(API.getDraftsTotal)) || 0
    runInAction(() => {
      this.draftsTotal = res
    })
  }

  // 获取工单数量
  @action async getFilterType() {
    const res = (await axios.get(API.getFilterType)) || {}
    this.queryApproveCount()
    this.getEntrustTicketCount()
    runInAction(() => {
      this.ticketFilterType = res
    })
  }

  // 获取工单数量
  @action async getEntrustTicketCount() {
    const res = (await axios.get(API.getEntrustTicketCount)) || {}
    runInAction(() => {
      this.entrustTicketCount = res?.num
    })
  }

  // 变更开关用于获取是否需要展现功能
  @action async getSwitch() {
    const res = await axios.get(API.getSwitch)
    window.change_switch = res.change_switch || false
    window.shared_switch = res.shared_switch || false
    window.time_control = res.time_control || [-Infinity, Infinity]
    window.crossUnitReassign = res.crossUnitReassign
    window.localStorage.setItem('crossUnitReassign', res.crossUnitReassign)
    window.node_custom = res.node_custom || false
    window.quicklySearchDisable = res.quicklySearchDisable
    // 控制工单列表筛选中 部门字段是否支持"当前用户所在部门"按钮
    window.ticket_department_switch = res.ticket_department_switch || false

    this.relate_job = res.relate_job || false
  }

  // 控制工单模型是否可以审批
  @action async checkShowStatusButton() {
    const res = await axios.get(API.checkShowStatusButton)
    // true，表示用户不需要走审批流程；false,需要走审批
    this.showStatusButton = res
  }

  // 左边列表权限
  // 左边列表权限
  @action async queryProductPermissions() {
    const res = (await axios.get(API.queryProductPermissions)) || []

    let defaultHome = ''
    const codeArr = []
    const configMenuList = []
    const settingMenuList = []
    const ticketMenuList = []

    _.map(res, (item) => {
      if (item.defaultHome === 1) {
        defaultHome = item.code
      }
      if (item.type === 'CONFIG') {
        if (item.code === 'setting_management') {
          settingMenuList.push(item)
        } else {
          configMenuList.push(item)
        }
      } else {
        ticketMenuList.push(item)
      }
      codeArr.push(item.code)
      _.map(item.children, (child) => {
        if (child.defaultHome === 1) {
          defaultHome = child.code
        }
        child.isChild = true
        ticketMenuList.push(child)
        codeArr.push(child.code)
      })
    })
    runInAction(() => {
      this.defaultHome = defaultHome
      // 委托待办
      codeArr.push('entrustTodo')

      this.productPermissions = codeArr

      const entrustOrder = {
        code: 'entrustTodo',
        zhName: '委托待办',
        enName: 'entrust ticket',
        type: 'BUILT',
        children: [],
        defaultHome: 0,
        queryMenuView: {
          creator: [],
          orderRule: false,
          create_time: [],
          modelId: null,
          extParams: {
            columns: [
              'ticketNum',
              'ticketName',
              'creatorName',
              'creatorTime',
              'tacheName',
              'status',
              'executorAndGroup',
              'processName',
              'priority',
              'updateTime'
            ]
          },
          pageSize: 20,
          orderBy: null,
          source: [],
          model_id: [],
          priority: [],
          pageNum: 1,
          wd: null,
          executionGroup: null,
          modelAndTacheId: null,
          update_time: [],
          overdue: null,
          executor: [],
          filterOrg: null,
          filterType: null,
          orderField: 'updateTime',
          columnSelectedList: [
            {
              code: 'ticketNum',
              name: '流水号',
              sortedField: true,
              chosen: false,
              selected: false
            },
            {
              code: 'ticketName',
              name: '工单标题',
              disabled: true,
              sortedField: true,
              chosen: false,
              selected: false
            },
            {
              code: 'creatorName',
              name: '发起人',
              sortedField: false,
              chosen: false,
              selected: false
            },
            {
              code: 'creatorTime',
              name: '发起时间',
              sortedField: true,
              chosen: false,
              selected: false
            },
            {
              code: 'tacheName',
              name: '当前阶段',
              sortedField: false,
              chosen: false,
              selected: false
            },
            {
              code: 'status',
              name: '工单状态',
              sortedField: true,
              chosen: false,
              selected: false
            },
            {
              code: 'executorAndGroup',
              name: '处理人/组',
              sortedField: false,
              chosen: false,
              selected: false
            },
            {
              code: 'processName',
              name: '模型',
              sortedField: false,
              chosen: false,
              selected: false
            },
            {
              code: 'priority',
              name: '优先级',
              sortedField: true,
              chosen: false,
              selected: false
            },
            {
              code: 'updateTime',
              name: '更新时间'
            }
          ],
          querySelectedList: [],
          status: ['1']
        },
        iconName: 'weituo1',
        orderField: null
      }
      const ticketMenuListCode = ticketMenuList?.map((v) => v.code).indexOf('mytodo')
      if (ticketMenuListCode != -1) {
        ticketMenuList.splice(ticketMenuListCode + 1, 0, entrustOrder)
      } else {
        ticketMenuList.unshift(entrustOrder)
      }

      this.menuList = { configMenuList, settingMenuList, ticketMenuList }
    })
    return defaultHome
  }

  // 检查模型、字段、触发器、SLA管理模块 新增、删除、维护记录权限
  @action async checkConfigAuthor() {
    const res = (await axios.get(API.checkConfigAuthor)) || {}
    runInAction(() => {
      this.configAuthor = res
    })
  }

  // 模型字段名称校验开关
  @action async getFilterNamesByRegular() {
    // url 都没找到，注释掉
    // const res = await axios.get(API.filterNamesByRegular)
    // runInAction(() => {
    //   this.filterNamesByRegular = Boolean(res)
    // })
  }

  // 检查所有工单列表操作权限
  @action async checkListOperation() {
    const res = (await axios.get(API.checkListOperation)) || {}
    runInAction(() => {
      this.ticketListOperation = res
      window.localStorage.setItem('customHandlingComments', res.customHandlingComments)
    })
  }

  @action setTicketListOperation(res) {
    this.ticketListOperation = res
  }

  @action isHavePrivilege() {
    const { authorizedApps } = runtimeStore.getState()
    const list = _.filter(authorizedApps, (item) =>
      _.includes(_.keys(this.productNum), item.name.toLowerCase())
    )
    Promise.all(
      _.map(list, (item) => axios.get(API.isHavePrivilege, { params: { productNum: item.code } }))
    ).then((res) => {
      const productNum = {}
      for (const idx in list) {
        const key = list[idx].name.toLowerCase()
        productNum[key] = res[idx]
      }
      runInAction(() => {
        this.productNum = {
          ...this.productNum,
          ...productNum
        }
      })
    })
  }

  // auto权限
  @action.bound
  async getAutomationPer() {
    const res = await axios.get(API.isHavePrivilege, { params: { productNum: 1005 } })
    runInAction(() => {
      this.productNum = {
        ...this.productNum,
        automation: res
      }
    })
    return res
  }

  // CMDB 权限
  @action.bound async checkUserPermission() {
    const res = await axios.get(API.CHECKUSERPERMISSION)
    runInAction(() => {
      this.productNum = {
        ...this.productNum,
        cmdb: res
      }
    })
  }

  // 获取批量处理入口的权限
  @action async isShowBatchHandle() {
    const res = await axios.get(API.isShowBatchHandle)
    runInAction(() => {
      this.routePermissions = {
        ...this.routePermissions,
        isShowBatch: res
      }
    })
  }

  @action async checkUserChangeAuth(params) {
    const res = await axios.get(API.checkUserChangeAuth, { params })
    runInAction(() => {
      this.routePermissions = {
        ...this.routePermissions,
        hasChangeAuth: res
      }
    })
  }

  // 创建工单入口
  @action async getConfig() {
    const res = await axios.get(API.query_system, { params: { type: 'switch' } })
    const createTicket = _.find(res.list, (o) => {
      return o.code === 'catalog'
    })
    const openType = createTicket ? createTicket.value.openType : ['1', '1']
    runInAction(() => {
      this.openType = openType
    })
    return openType
  }

  // 设置工单的查询视图
  @action setTicketQueryViews(views = {}) {
    if (!views) {
      this.ticketQueryViews = {}
    }

    this.ticketQueryViews = {
      ...this.ticketQueryViews,
      ...views
    }
  }

  // 获取授权的产品
  @action
  async getGrantedApp() {
    const res = (await axios.get(API.getGrantedApp)) || {}

    runInAction(() => {
      this.grantedApp = res
    })
  }

  @action
  async getFileAccept() {
    const res = (await axios.get(API.getFileAccept)) || []
    runInAction(() => {
      this.fileAccept = res
    })
  }

  @action async queryApproveCount() {
    const res = await axios.get(API.queryApproveCount)
    runInAction(() => {
      this.approveCount = res
    })
  }

  @action
  getTicketRecord(record) {
    this.ticketRecord = record
  }

  // 获取优先级的配置
  @action async getTicketPriority() {
    await axios.get(API.queryFieldUrgentLevel).then((res) => {
      this.priorityList = getPriorityList(res)
    })
  }

  // 获取催办间隔时间
  @action async getTicketUrgingTime() {
    axios.get(API.getSwitchValue, { params: { codes: 'recentlyRemindTicketTime' } }).then((res) => {
      this.recentlyRemindTicketTime = res.recentlyRemindTicketTime
    })
  }

  // 发起子流程是是否校验表单必填项
  @action async getTicketIsVerify() {
    const res = await axios.get(API.getSwitchValue, {
      params: { codes: 'subProcessIsVerifyRequiredFields' }
    })

    let subProcessIsVerify = true
    if (res?.subProcessIsVerifyRequiredFields === false) {
      subProcessIsVerify = res?.subProcessIsVerifyRequiredFields
    }

    return subProcessIsVerify
  }

  // 未发起协办单的提示是否弹出
  @action async getTicketIsRemind() {
    const res = await axios.get(API.getSwitchValue, {
      params: { codes: 'isremindNoCoOrder' }
    })
    let isremindNoCoOrder = true // 默认提示
    if (res?.isremindNoCoOrder === false) {
      isremindNoCoOrder = res?.isremindNoCoOrder
    }
    return isremindNoCoOrder
  }

  @action async getMenuList() {
    const res = await axios.get(API.getMenuList)
    return res
  }
}
export default new Global()
