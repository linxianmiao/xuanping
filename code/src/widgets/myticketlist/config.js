import moment from 'moment'
import { i18n } from './i18n'
// 内置的查询对象，直接放在外边
export const builtInQuery = [
  'filterType',
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
  'queryArchived',
  'ticketNum',
  'orderBy',
  'sortRule',
  'pageNum',
  'pageSize',
  'participantsDepartIds'
]

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

// 所有工单查询需要移除的
export const removeFilter = [...builtInQuery, 'extraParams', 'checkFilterList', 'lockCondition']
// 所有工单的内置的工单列表
export const BUILTIN_TYPE_LIST = ['groupTodo', 'myfollow', 'mypartin', 'mytodo']
// 默认选中的定制列
export const defaultAttributeList = [
  'ticketNum',
  'ticketName',
  'processName',
  'priority',
  'status',
  'tacheName'
]

// 默认的定制列列表
export const defaultColumnList = [
  {
    code: 'ticketName',
    name: '名称',
    disabled: true
  },
  {
    code: 'ticketNum',
    name: '单号'
  },
  {
    code: 'processName',
    name: '服务类型'
  },
  {
    code: 'tacheName',
    name: '当前环节'
  },
  {
    code: 'departorName',
    name: '创建人部门'
  },
  {
    code: 'creatorName',
    name: '创建人'
  },
  {
    code: 'executorAndGroup',
    name: '处理人/处理组'
  },
  {
    code: 'creatorTime',
    name: '创建时间'
  },
  {
    code: 'updateTime',
    name: '更新时间'
  }
]

// 默认选中的列
export const defaultCheckedColumnCodes = [
  'ticketNum',
  'ticketName',
  'processName',
  'tacheName',
  'departorName',
  'creatorName',
  'executorAndGroup',
  'creatorTime',
  'updateTime'
]
/**
 * 找出当前选中的查询器
 * @param {String} code 选中的查询器code
 * @param {Array} queryerList 查询器列表
 */
export function getQueryer(code, queryerList) {
  if (_.isEmpty(queryerList)) return
  let data
  for (const item of queryerList) {
    if (item.code === code) {
      data = item
      break
    }
    if (item.type === 'GROUP') {
      data = getQueryer(code, item.children)
      if (data) return data
    }
  }
  return data
}

// 前端的filterType是查询器的code，需要将code转为后端识别的filterType
export function getFilterType(filterType) {
  switch (filterType) {
    case 'mytodo':
    case 'groupTodo':
      return 'todo'
    case 'myfollow':
      return 'myFollow'
    case 'mypartin':
      return 'myPartIn'
    case 'mycheck':
      return 'approve'
    case 'archived':
      return 'archived'
    case 'mycreate':
      return 'myCreate'
    case 'myapprove':
      return 'myapprove'
    case 'all':
      return 'all'
    default:
      return filterType
  }
}

// 处理时间，将时间转成 00：00：00  - 23：59：59 的

function getTime(times) {
  const format = 'YYYY-MM-DD HH:mm:ss'
  if (_.isEmpty(times)) {
    return []
  }
  if (_.isString(times)) {
    return [times]
  }
  if (['CurrentDay', 'CurrentWeek', 'CurrentMonth'].includes(_.head(times))) {
    return times
  }
  return [
    moment(times[0]).startOf('day').format(format),
    moment(times[1]).endOf('day').format(format)
  ]
}
// 对query对象进行处理
export function getQuery(query, allField) {
  let list = []
  const newQuery = {}

  if (_.isArray(allField)) {
    list = allField
  } else {
    const { builtinFields, extendedFields } = allField || {
      builtinFields: [],
      extendedFields: []
    }
    list = [...builtinFields, ...extendedFields]
  }

  const timeList = [
    'create_time',
    'update_time',
    ..._.chain(list)
      .filter((item) => item.type === 'dateTime')
      .map((item) => item.code)
      .value()
  ]

  for (const [key, value] of _.entries(query)) {
    if (value == null || (_.isArray(value) && _.isEmpty(value))) {
      newQuery[key] = undefined
    } else {
      newQuery[key] = value
    }
  }

  const timeObj = _.reduce(
    timeList,
    (sum, item) => {
      if (_.has(query, item)) {
        const time = getTime(query[item])
        return { ...sum, [item]: time }
      }
      return sum
    },
    {}
  )

  return _.assign(
    {},
    newQuery,
    timeObj,
    { filterType: getFilterType(newQuery.filterType) }
    // { orderBy: 'updateTime', sortRule: 'descend' }
  )
}

export function isJSON(data) {
  try {
    if (typeof JSON.parse(data) === 'object') {
      return true
    }
  } catch (e) {
    return false
  }
  return false
}
// 解析数组字段类型的数据为数组
export function parseTagsDataToArray(data) {
  if (!data) {
    return []
  }
  if (Array.isArray(data)) {
    return data
  }
  if (isJSON(data)) {
    return JSON.parse(data)
  }
  return []
}

export const DEFAULT_FILTER_LIST = [
  // {
  //   name: i18n('ticket-list-table-th-ticketNum', '单号'),
  //   code: 'ticketNum',
  //   type: 'singleRowText'
  // },
  // {
  //   name: i18n('ticket-list-table-th-title', '名称'),
  //   code: 'ticketName',
  //   type: 'singleRowText'
  // },
  {
    name: i18n('ticket-list-table-th-processName', '服务类型'),
    code: 'modelId',
    type: 'modelSelect'
  },
  // {
  //   name: '流程状态',
  //   code: 'status',
  //   type: 'select',
  //   params: [
  //     {
  //       label: i18n('ticket.list.status_1', '待处理'),
  //       value: '1'
  //     },
  //     {
  //       label: i18n('ticket.list.status_2', '处理中'),
  //       value: '2'
  //     },
  //     {
  //       label: i18n('ticket.list.status_3', '已完成'),
  //       value: '3'
  //     },
  //     {
  //       label: i18n('ticket.list.status_7', '已关闭'),
  //       value: '7'
  //     },
  //     {
  //       label: i18n('ticket.list.status_10', '挂起'),
  //       value: '10'
  //     },
  //     {
  //       label: i18n('ticket.list.status_11', '已废除'),
  //       value: '11'
  //     }
  //   ]
  // },
  {
    name: '当前环节',
    code: 'modelAndTacheId',
    type: 'modelTache'
  }
]

export const ALL_FILTER_LIST = [
  // {
  //   name: i18n('ticket-list-table-th-department', '创建人部门'), // 创建人部门
  //   code: 'filterOrg',
  //   type: 'department'
  // }
  {
    name: '服务类型',
    code: 'modelId',
    type: 'modelSelect'
  },
  {
    name: '处理组',
    code: 'executionGroup',
    type: 'group'
  },
  {
    name: '创建人所在部门',
    code: 'filterOrg',
    type: 'department'
  },
  {
    name: '参与人所在部门',
    code: 'participantsDepartIds',
    type: 'department'
    // disabled: true
  },
  {
    name: '处理人',
    code: 'executor',
    type: 'user'
  },
  {
    name: '创建人',
    code: 'creator',
    type: 'user'
  },
  // {
  //   name: '工单来源',
  //   code: 'source',
  //   type: 'select',
  //   params: [
  //     {
  //       label: 'ITSM',
  //       value: 'itsm'
  //     },
  //     {
  //       label: '微信',
  //       value: 'wechat'
  //     },
  //     {
  //       label: '工单导入',
  //       value: 'import'
  //     },
  //     {
  //       label: '告警',
  //       value: 'alert'
  //     },
  //     {
  //       label: 'ChatOps',
  //       value: 'chatops'
  //     },
  //     {
  //       label: 'CMDB',
  //       value: 'cmdb'
  //     },
  //     {
  //       label: '服务请求',
  //       value: 'catalog'
  //     },
  //     {
  //       label: '资产',
  //       value: 'asset'
  //     },
  //     {
  //       label: '其他',
  //       value: 'other'
  //     }
  //   ]
  // },
  {
    name: '创建时间',
    code: 'create_time',
    type: 'dateTime'
  },
  {
    name: '更新时间',
    code: 'update_time',
    type: 'dateTime'
  },
  {
    name: '参与人',
    code: 'participants',
    type: 'user'
  }
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
