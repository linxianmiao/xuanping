import React from 'react'

const StoreContext = React.createContext()

export const StoreProvider = StoreContext.Provider
export const StoreConsumer = StoreContext.Consumer

// 人员组件的value初始化
export const userPickerValue = {
  groups: [],
  users: [],
  departs: [],
  dutys: [],
  roles: [],
  variables: [],
  matrix: [],
  crossUnitUsers: [],
  crossUnitGroups: [],
  userVariable: [],

  all: []
}
/**
 * 新的组件用的对象，itsm原始数据使用的是type区分
 *  0 === 用户组 === groups
 *  1 === 人员 ===  users
 *  2 === 部门 === departs
 *  3 === 角色 === roles
 *  4 === 值班 === dutys
 *  5 === 变量 === variables
 *  6 === 矩阵 === matrix
 *  7 === 跨租户用户 === crossUnitUsers
 *  8 === 跨租户用户组 === crossUnitGroups
 *  9 === 人员变量 === userVariable
 */
const TYPE_LIST = [
  'groups',
  'users',
  'departs',
  'roles',
  'dutys',
  'variables',
  'matrix',
  'crossUnitUsers',
  'crossUnitGroups',
  'userVariable'
]
// 根据对象的key转为数组的type
export function ObjectKeyToArrayType(key) {
  return _.findIndex(TYPE_LIST, (item) => item === key)
}
// 根据 数组的type转为对象的key
export function ArrayTypeToObjectKey(type) {
  return _.find(TYPE_LIST, (item, index) => index === type)
}

export function ArrayToObject(data) {
  return _.reduce(
    _.compact(data),
    (obj, item) => {
      // switch (Number(item.type)) {
      //   case 0: obj.groups.push({ groupId: item.id, name: item.name }); break
      //   case 1: obj.users.push({ userId: item.id, realname: item.name, type: item.type }); break
      //   case 2: obj.departs.push(item); break
      //   case 3: obj.roles.push(item); break
      //   case 4: obj.dutys.push(item); break
      //   case 5: obj.variables.push(item); break
      //   case 6: obj.matrix.push(item); break
      //   case 7: obj.crossUnitUsers.push(item); break
      //   case 8: obj.crossUnitGroups.push(item); break
      // }

      let nextItem = { ...item }

      if (item.type === 0) {
        nextItem = { groupId: item.id, name: item.name }
      } else if (item.type === 1) {
        nextItem = { userId: item.id, realname: item.name }
      }

      nextItem.type = ArrayTypeToObjectKey(item.type)

      obj.all.push(nextItem)

      return obj
    },
    _.cloneDeep(userPickerValue)
  )
}

export function ObjectToArray(obj) {
  // return _.chain(obj)
  //   .map((value, key) => {
  //     if (key === 'users') {
  //       return _.map(value, item => ({ id: item.userId, name: item.realname, type: ObjectKeyToArrayType(key) }))
  //     } else if (key === 'groups') {
  //       return _.map(value, item => ({ id: item.groupId, name: item.name, type: ObjectKeyToArrayType(key) }))
  //     } else if (key === 'crossUnitUsers' || key === 'crossUnitGroups') {
  //       return _.map(value, item => ({
  //         id: item.id,
  //         tenantId: item.tenantId,
  //         name: item.name,
  //         type: ObjectKeyToArrayType(key),
  //       }))
  //     } else {
  //       return _.map(value, item => _.pick(
  //         _.assign({}, item, { type: ObjectKeyToArrayType(key) }),
  //         ['id', 'name', 'type', 'code', 'matrixInfoVOS']
  //       ))
  //     }
  //   })
  //   .flatten()
  //   .value()

  return _.map(obj.all, (item) => {
    const nextType = ObjectKeyToArrayType(item.type)

    if (item.type === 'users') {
      return { id: item.userId, name: item.realname, type: nextType }
    } else if (item.type === 'groups') {
      return { id: item.groupId, name: item.name, type: nextType }
    } else if (item.type === 'crossUnitUsers' || item.type === 'crossUnitGroups') {
      return {
        id: item.id,
        tenantId: item.tenantId,
        name: item.name,
        type: nextType
      }
    } else {
      return _.pick(
        _.assign({}, item, { type: nextType }),
        // departPath用于部门字段展示选中项的部门路径
        ['id', 'name', 'type', 'code', 'matrixInfoVOS', 'departPath', 'departId']
      )
    }
  })

  // return obj.all || []
}
/**
 * 根据tabs返回Tootip 的title
 * @param {Array} tabs
 */
export function getTootipTitle(tabs) {
  switch (_.head(tabs)) {
    case 0:
      return '当前用户所在组'
    case 1:
      return '当前用户'
    case 2:
      return '当前用户所在部门'
    default:
      return null
  }
}
// 所有工单更多筛选那里的扩展功能
export const EXTEND_LIST = [
  {
    userId: 'currentUser',
    realname: '当前用户',
    type: 'users'
  },
  {
    groupId: 'currentGroup',
    name: '当前用户所在组',
    type: 'groups'
  },
  {
    id: 'currentDepart',
    name: '当前用户所在部门',
    type: 'departs'
  }
]
// 获取人员得接口
export async function getUsers(params, store, extendQuery, method) {
  const { userInfo: kw, departId, groupId, pageIndex: pageNo, pageSize } = params
  const res = await store.getList(
    _.assign({}, { kw, departId, groupId, pageNo, pageSize, type: 1 }, extendQuery),
    method
  )
  const records = _.map(res.list, (item) => {
    const { id: userId, account, name: realname, mail: email, userDepartment: departs } = item
    return { userId, account, realname, email, departs }
  })
  return {
    records: records,
    pageNo: pageNo,
    pageSize: pageSize,
    count: res.count
  }
}

const getType = (type) => {
  switch (type) {
    case 'groups':
      return 0
    case 'departs_custom':
      return 2
    case 'roles_custom':
      return 3
    default:
      return 1
  }
}

const getTypes = (type) => {
  switch (type) {
    case 'groups':
      return 'groups'
    case 'departs_custom':
      return 'departs'
    case 'roles_custom':
      return 'roles'
    default:
      return null
  }
}

// 搜索人员接口
export async function searchUsers(params, store, extendQuery, method, showTypes) {
  const { keyword: kw, departId, groupId, page_index: pageNo, page_size: pageSize } = params

  let res = {}
  let records = []
  if (Array.isArray(showTypes) && !_.includes(showTypes, 'users') && getType(showTypes[0]) !== 1) {
    let params = {
      type: getType(showTypes[0]),
      kw
    }
    if (['groups', 'roles_custom', 'duty_custom', 'user_variable'].includes(showTypes[0])) {
      params = {
        ...params,
        pageNo,
        pageSize,
        lazyLoad: false
      }
    }
    res = await store.getList(_.assign({}, params, extendQuery), method)
    records = _.map(res.list, (item) => {
      const { id, name, departPath = null } = item
      let list = {
        id,
        name,
        type: getTypes(showTypes[0])
      }
      if (showTypes[0] === 'groups') {
        list.groupId = id
      } else {
        list.departPath = departPath
        list.departId = id
      }
      return list
    })
  } else {
    res = await store.getList(
      _.assign({}, { kw, departId, groupId, pageNo, pageSize, type: 1 }, extendQuery),
      method
    )
    records = _.map(res.list, (item) => {
      const { id, account, name, userDepartment: departs, mail: email } = item
      return { id, account, name, email, departs, type: 'users', userId: id, realname: name }
    })
  }

  return {
    records: records,
    pageNo: pageNo,
    pageSize: pageSize,
    total: records.length
  }
}
// 获取用户组接口
export async function getGroups(params, store, extendQuery, method) {
  const { name: kw, pageIndex: pageNo, pageSize, categoryId } = params
  const res = await store.getList(
    _.assign({}, { kw, pageNo, pageSize, type: 0, categoryId }, extendQuery),
    method
  )
  const records = _.map(res.list, (item) => {
    const { id: groupId, name, code, hierarchy } = item
    return { groupId, name, code, hierarchy }
  })
  return {
    records: records,
    pageNo: pageNo,
    pageSize: pageSize,
    total: res.count
  }
}
// 自定义获取部门数据的接口
export async function getDeparts(params, store, extendQuery) {
  const { parent_depart_id } = params
  const res = await store.getList({
    departId: parent_depart_id,
    type: 2,
    tenantId: extendQuery?.tenantId
  })
  const records = _.map(res.list, (item) => {
    const { id: departId, name, isLeaf } = item
    return { departId, name, pid: parent_depart_id, isLeaf }
  })
  return records
}
// 自定义搜索部门数据的接口
export async function getDepartList(params, store, extendQuery) {
  const { name } = params
  const pageSize = params.pageSize || 15
  const pageNo = params.pageIndex || 1
  const QUERY = _.cloneDeep(extendQuery)
  QUERY && delete QUERY.fieldCode
  const res = await store.getList({ kw: name, pageNo, pageSize, type: 2, ...QUERY }, 'get')
  const records = _.map(res.list, (item) => {
    const { id: departId, name, isLeaf, hierarchy } = item
    return { departId, name, isLeaf, hierarchy }
  })
  return { records, pageSize, pageNo }
}

export function flatDeparts(currentDepart) {
  return currentDepart.reduce((arr, item) => {
    if (item.childrens) {
      return [...arr, item, ...flatDeparts(item.childrens)]
    }
    return [...arr, item]
  }, [])
}
