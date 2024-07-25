import moment from 'moment'
import {
  allDefaultQueryList,
  todoDefaultQueryList,
  followDefaultQueryList,
  allDefaultQueryListUpdate,
  myApproveDefaultQueryList
} from './config/selectDefaultList'

function momentArrayToStringArray(times) {
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
    // moment(times[0])
    //   .startOf('day')
    //   .format(format),
    // moment(times[1])
    //   .endOf('day')
    //   .format(format)
    times[0],
    times[1]
  ]
}

export function detailTime(query, allField) {
  let list = []
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
  const timeObj = _.reduce(
    timeList,
    (sum, item) => {
      if (_.has(query, item)) {
        const time = momentArrayToStringArray(query[item])
        return { ...sum, [item]: time }
      }
      return sum
    },
    {}
  )
  return _.assign({}, query, timeObj)
}

function getTicketQueryKey(menuKey) {
  switch (menuKey) {
    case 'myfollow':
      return 'myFollow'
    case 'mypartin':
      return 'myPartIn'
    case 'groupTodo':
      return 'groupTodo'
    case 'myTodo':
    case 'mytodo':
      return 'myToDo'
    case 'entrustTodo':
      return 'entrust'
    case 'mycreate':
      return 'mycreate'
    case 'all_ticket':
      return 'all'
    case 'mycheck':
      return 'mycheck'
    case 'archived':
      return 'archived'
    default:
      return menuKey
  }
}

const getCheckFilterList = (type, defaultList) => {
  switch (type) {
    case 'myFollow':
    case 'myPartIn':
      return [].concat(followDefaultQueryList)
    case 'all':
      return [].concat(allDefaultQueryListUpdate)
    case 'archived':
    case 'mycreate':
      return [].concat(allDefaultQueryList)
    case 'myToDo':
    case 'entrust':
    case 'groupTodo':
    case 'mycheck':
    case 'todoGroup':
      return [].concat(todoDefaultQueryList)
    case 'myapprove':
      return myApproveDefaultQueryList
    default:
      return defaultList
  }
}

const setQueryHide = (type, code) => {
  // 在更多筛选中不显示
  switch (type) {
    case 'myToDo':
    case 'groupTodo':
    case 'mycheck':
    case 'entrust':
    case 'todoGroup':
      return code === 'status' || code === 'executionGroup' || code === 'executor'
    default:
      return false
  }
}

export const getQueryAndColumns = (ticketMenuList, type) => {
  const currentMenuData =
    _.find(ticketMenuList, (menu) => getTicketQueryKey(menu.code) === type) || {}
  const queryMenuView = _.get(currentMenuData, 'queryMenuView', {})
  const extParams = _.get(currentMenuData, 'queryMenuView.extParams', {})
  const querySelected = _.get(currentMenuData, 'queryMenuView.querySelectedList')
  const columnSelected = _.get(currentMenuData, 'queryMenuView.columnSelectedList')
  const checkFilterList = _.get(currentMenuData, 'queryMenuView.checkFilterList')
  const queryArchived = _.get(currentMenuData, 'queryArchived')
  const selectedColumnsWidth = _.get(queryMenuView, 'selectedColumnsWidth')
  const query = {}
  if (_.get(queryMenuView, 'orderField')) {
    query.orderBy = queryMenuView.orderField
    query.sortRule = queryMenuView.orderField === 'status' ? 'ascend' : 'descend'
  }
  // 查询条件优化
  let queryList = []
  let queryListCode = []
  let columnsList = []
  let columnsListCode = []
  const keys = _.concat(_.keys(queryMenuView), _.keys(extParams))
  const filterKey = ['extParams', 'columns', 'orderField', 'checkFilterList', 'lockCondition']
  if (querySelected && columnSelected) {
    columnsList = columnSelected
    columnsListCode = columnSelected.map((item) => item.code)
    if (querySelected.length) {
      // 自定义查询器
      queryListCode = querySelected.map((item) => item.code)
      queryList = querySelected
    } else {
      // 内置列表 没有定制查询条件
      queryListCode = getCheckFilterList(
        type,
        _.filter(keys, (item) => filterKey.indexOf(item) === -1)
      )
      queryList = queryListCode.map((item) => {
        return {
          code: item,
          value: queryMenuView[item] || extParams[item],
          hide: setQueryHide(type, item)
        }
      })
    }
  } else {
    // 处理老数据没有querySelected和columnSelected
    columnsListCode = extParams.columns || []
    queryListCode =
      checkFilterList ||
      getCheckFilterList(type, _.uniq(_.filter(keys, (item) => filterKey.indexOf(item) === -1)))
    columnsList = columnsListCode.map((item) => {
      return { code: item }
    })
    queryList = queryListCode.map((item) => {
      return {
        code: item,
        value: queryMenuView[item] || extParams[item],
        hide: setQueryHide(type, item)
      }
    })
  }
  // 打开全局开关时，所有工单筛选中，申请部门字段默认选择当前所属部门
  if (window.ticket_department_switch && type === 'all') {
    if (!queryList.find((item) => item.code === 'applicationSector')) {
      queryListCode.push('applicationSector')
      queryList.push({
        code: 'applicationSector',
        value: ['currentDepart'],
        hide: false
      })
    }
  }
  _.forEach(queryList, (item) => {
    query[item.modelId ? `${item.modelId}_${item.code}` : item.code] = item.value
  })

  return {
    query,
    columnsListCode,
    queryListCode,
    queryList,
    columnsList,
    queryArchived,
    selectedColumnsWidth
  }
}
