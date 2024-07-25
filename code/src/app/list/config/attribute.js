const attribute = [
  {
    code: 'ticketName',
    name: i18n('ticket-list-table-th-title', '工单标题'),
    disabled: true,
    sortedField: true
  },
  {
    code: 'ticketNum',
    name: i18n('ticket-list-table-th-ticketNum', '流水号'),
    sortedField: true
  },
  {
    code: 'processName',
    name: i18n('ticket-list-table-th-processName', '模型'),
    sortedField: false
  },
  {
    code: 'tacheName',
    name: i18n('ticket-list-table-th-tacheName', '当前节点'),
    sortedField: false
  },
  {
    name: '当前阶段',
    code: 'activityStageName',
    sortedField: false
  },
  {
    code: 'priority',
    name: i18n('ticket-list-table-th-priority', '优先级'),
    sortedField: true
  },
  {
    code: 'status',
    name: i18n('ticket-list-table-th-status', '工单状态'),
    sortedField: true
  },
  {
    code: 'creatorName',
    name: i18n('ticket-list-table-th-creatorName', '创建人'),
    sortedField: false
  },
  {
    code: 'executorAndGroup',
    name: '处理人/组',
    sortedField: false
  },
  {
    name: i18n('participant', '参与人'),
    code: 'participants',
    sortedField: false
  },
  {
    code: 'creatorTime',
    name: i18n('ticket-list-table-th-creator_time', '创建时间'),
    sortedField: true
  },
  {
    code: 'updateTime',
    name: i18n('ticket.list.update_time', '更新时间'),
    sortedField: true
  }
]

export const attributeRelate = [
  {
    name: i18n('ticket.relateTicket.title', '标题'),
    code: 'title',
    disabled: true,
    sortedField: false
  },
  {
    name: i18n('ticket.relateTicket.ticketNum', '流水号'),
    code: 'ticketNum',
    sortedField: false
  },
  {
    name: i18n('ticket.relateTicket.type', '关系类型'),
    code: 'ticketRelationType',
    sortedField: false
  },
  {
    name: i18n('ticket.relateTicket.modelName', '流程类型'),
    code: 'modelName',
    sortedField: false
  },
  {
    name: i18n('ticket.relateTicket.activity', '流程环节'),
    code: 'activityName',
    sortedField: false
  },
  {
    name: i18n('ticket.relateTicket.status', '流程状态'),
    code: 'status',
    sortedField: false
  },
  {
    name: i18n('ticket.relateTicket.handle', '处理组/人'),
    code: 'executorAndGroup',
    sortedField: false
  }
]

// 定制列可以支持排序的Types
export const SOTERFIELDTYPES = new Set(['int', 'double', 'dateTime'])

// 内置属性可以支持排序的code
export const BUILTIN_DATAINDEX = new Set(
  _.filter(attribute, (item) => item.sortedField).map((item) => item.code)
)

// 内置属性可以支持排序的code
export const BUILTIN_MENUCODE = new Set([
  'myfollow',
  'mytodo',
  'mypartin',
  'myToDo',
  'myFollow',
  'myPartIn'
])

export default attribute
