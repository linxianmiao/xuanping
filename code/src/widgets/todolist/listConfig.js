import { i18n } from './i18n'

export const BUILTIN_FIELD_TYPE = [
  'singleRowText',
  'multiRowText',
  'listSel',
  'singleSel',
  'multiSel',
  'int',
  'double',
  'dateTime',
  'timeInterval',
  'user',
  'department',
  'cascader',
  'table',
  'customizeTable',
  'richText',
  'securityCode',
  'resource',
  'attachfile',
  'tags',
  'links',
  'nodeExecution',
  'permission',
  'jsontext'
]

// 默认的查询条件对象
export const originalQuery = {
  processId: undefined,
  modelId: undefined,
  wd: undefined,
  executor: undefined,
  creator: undefined,
  priority: undefined,
  source: undefined,
  status: undefined,
  overdue: undefined,
  create_time: undefined,
  update_time: undefined,
  filterOrg: undefined,
  modelAndTacheId: undefined,
  executionGroup: undefined
}

// 默认的定制列列表
export const defaultColumnList = [
  {
    code: 'ticketName',
    name: i18n('ticket-list-table-th-title', '工单标题'),
    disabled: true
  },
  {
    code: 'ticketNum',
    name: i18n('ticket-list-table-th-ticketNum', '流水号')
  },
  {
    code: 'processName',
    name: i18n('ticket-list-table-th-processName', '模型')
  },
  {
    code: 'tacheName',
    name: i18n('ticket-list-table-th-tacheName', '当前节点')
  },
  {
    code: 'priority',
    name: i18n('ticket-list-table-th-priority', '优先级')
  },
  {
    code: 'status',
    name: i18n('ticket-list-table-th-status', '工单状态')
  },
  {
    code: 'creatorName',
    name: i18n('ticket-list-table-th-creatorName', '创建人')
  },
  {
    code: 'executorAndGroup',
    name: '处理人/处理组'
  },
  {
    code: 'creatorTime',
    name: i18n('ticket-list-table-th-creator_time', '创建时间')
  },
  {
    code: 'updateTime',
    name: i18n('ticket.list.update_time', '更新时间')
  }
]

// 默认选中的列
export const defaultCheckedColumnCodes = [
  'ticketName',
  'ticketNum',
  'processName',
  'tacheName',
  'priority',
  'status',
  'creatorName',
  'executorAndGroup',
  'creatorTime',
  'updateTime'
]

// 默认筛选条件
export const defaultFilterList = [
  {
    name: i18n('ticket.list.ticketName', '标题'),
    code: 'ticketName',
    type: 'singleRowText'
  },
  {
    name: i18n('ticket.list.ticketNum', '单号'),
    code: 'ticketNum',
    type: 'singleRowText'
  },
  {
    name: i18n('ticket.list.filter.model', '模型'),
    code: 'modelId',
    type: 'modelSelect'
    // params: [] // 待填充后端数据
  },
  {
    name: i18n('ticket.list.tacheName', '当前节点'),
    code: 'modelAndTacheId',
    type: 'modelTache'
  },
  {
    name: i18n('ticket-list-table-th-executionGroup', '处理组'),
    code: 'executionGroup',
    type: 'group'
  },
  {
    name: i18n('ticket.list.filter.filterOrg', '创建人所在部门'),
    code: 'filterOrg',
    type: 'department'
  },
  {
    name: i18n('ticket-list-table-th-assignee', '处理人'),
    code: 'executor',
    type: 'user'
  },
  {
    name: i18n('ticket-list-table-th-creatorName', '创建人'),
    code: 'creator',
    type: 'user'
  },
  {
    name: i18n('ticket-list-table-th-priority', '优先级'),
    code: 'priority',
    type: 'select',
    params: [] // 待填充后端数据
  },
  {
    name: i18n('ticket.list.source', '工单来源'),
    code: 'source',
    type: 'select',
    params: [
      { label: i18n('globe.itsm', 'ITSM'), value: 'itsm' },
      { label: i18n('globe.wechat', '微信'), value: 'wechat' },
      { label: i18n('globe.import', '工单导入'), value: 'import' },
      { label: i18n('globe.alert', '告警'), value: 'alert' },
      { label: i18n('globe.chatops', 'ChatOps'), value: 'chatops' },
      { label: i18n('globe.cmdb', 'CMDB'), value: 'cmdb' },
      { label: i18n('globe.catalog', '服务请求'), value: 'catalog' },
      { label: i18n('globe.asset', '资产'), value: 'asset' },
      { label: i18n('globe.other', '其他'), value: 'other' }
    ]
  },
  {
    name: i18n('ticket-list-table-th-status', '工单状态'),
    code: 'status',
    type: 'select',
    params: [
      { label: i18n('ticket.list.status_1', '待处理'), value: '1' },
      { label: i18n('ticket.list.status_2', '处理中'), value: '2' },
      { abel: i18n('ticket.list.status_3', '已完成'), value: '3' },
      { label: i18n('ticket.list.status_7', '已关闭'), value: '7' },
      { label: i18n('ticket.list.status_10', '挂起'), value: '10' },
      { label: i18n('ticket.list.status_11', '已废除'), value: '11' }
    ]
  },
  {
    name: i18n('ticket.list.name3', '逾期状态'),
    code: 'overdue',
    type: 'select',
    params: [
      { label: i18n('ticket.list.overdueStatus_0', '未逾期'), value: 0 },
      { label: i18n('ticket.list.overdueStatus_1', '已逾期'), value: 1 },
      { label: i18n('ticket.list.overdueStatus_2', '逾期已恢复'), value: 2 }
    ]
  },
  {
    name: i18n('ticket.list.creator_time', '创建时间'),
    code: 'create_time',
    type: 'dateTime'
  },
  {
    name: i18n('ticket.list.update_time', '更新时间'),
    code: 'update_time',
    type: 'dateTime'
  }
]

// 默认筛选条件的code
// export const defaultFilters = R.pluck('code', defaultFilterList)

// 用来过滤query条件
export const queryScope = [
  'modelId',
  'executor',
  'creator',
  'priority',
  'source',
  'status',
  'overdue',
  'create_time',
  'update_time',
  'filterOrg',
  'modelAndTacheId',
  'executionGroup',
  'wd',
  'ticketName',
  'ticketNum',
  'orderBy',
  'sortRule'
]

// 默认的筛选条件
export const defaultFilterCodes = [
  'create_time',
  'creator',
  'executionGroup',
  'executor',
  'extParams',
  'filterOrg',
  'filterType',
  'modelAndTacheId',
  'modelId',
  'orderBy',
  'orderRule',
  'overdue',
  'priority',
  'source',
  'status',
  'ticketName',
  'ticketNum',
  'update_time',
  'wd'
]

// 请求接口需要排除的筛选项
// extraFilters 等于接口返回的数据与 exclusiveFilters 的差集
export const exclusiveFilters = [
  // 'processId', // 自己加了个processId，不然请求getAllList的时候，总会请求queryFieldInfosByCodes
  'extraParams',
  'modelId',
  'wd',
  'executor',
  'creator',
  'priority',
  'source',
  'status',
  'overdue',
  'filterOrg',
  'modelAndTacheId',
  'executionGroup',
  'name',
  'viewName',
  'viewId',
  'extParams',
  'create_time',
  'update_time',
  'orderBy',
  'sortRule',
  'filterType',
  'orderRule'
]
