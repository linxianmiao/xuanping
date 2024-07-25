import React from 'react'
import { i18n } from '../../../i18n'

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
  variables: []
}
/**
 * 新的组件用的对象，itsm原始数据使用的是type区分
 *  0 === 用户组 === groups
 *  1 === 人员 ===  users
 *  2 === 部门 === departs
 *  3 === 角色 === roles
 *  4 === 值班 === dutys
 *  5 === 变量 === variables
 */
const TYPE_LIST = [
  'groups',
  'users',
  'departs',
  'roles',
  'dutys',
  'variables'
]
// 根据对象的key转为数组的type
export function ObjectKeyToArrayType(key) {
  return _.findIndex(TYPE_LIST, item => item === key)
}
// 根据 数组的type转为对象的key
export function ArrayTypeToObjectKey(type) {
  return _.find(TYPE_LIST, (item, index) => index === type)
}

export function ArrayToObject(data) {
  return _.reduce(_.compact(data), (obj, item) => {
    switch (Number(item.type)) {
      case 0: obj.groups.push({ groupId: item.id, name: item.name }); break
      case 1: obj.users.push({ userId: item.id, realname: item.name, type: item.type }); break
      case 2: obj.departs.push(item); break
      case 3: obj.roles.push(item); break
      case 4: obj.dutys.push(item); break
      case 5: obj.variables.push(item); break
    }
    return obj
  }, _.cloneDeep(userPickerValue))
}

export function ObjectToArray(obj) {
  return _.chain(obj)
    .map((value, key) => {
      if (key === 'users') {
        return _.map(value, item => ({ id: item.userId, name: item.realname, type: ObjectKeyToArrayType(key) }))
      } else if (key === 'groups') {
        return _.map(value, item => ({ id: item.groupId, name: item.name, type: ObjectKeyToArrayType(key) }))
      } else {
        return _.map(value, item => _.pick(
          _.assign({}, item, { type: ObjectKeyToArrayType(key) }),
          ['id', 'name', 'type', 'code']
        ))
      }
    })
    .flatten()
    .value()
}
/**
 * 根据tabs返回Tootip 的title
 * @param {Array} tabs
 */
export function getTootipTitle(tabs) {
  switch (_.head(tabs)) {
    case 0: return '当前用户所在组'
    case 1: return '当前用户'
    case 2: return '当前用户所在部门'
  }
}
// 所有工单更多筛选那里的扩展功能
export const EXTEND_LIST = [
  {
    userId: 'currentUser',
    realname: i18n('currentUser', '当前用户'),
    type: 1
  },
  {
    groupId: 'currentGroup',
    name: i18n('currentGroup', '当前用户所在组'),
    type: 0
  },
  {
    id: 'currentDepart',
    name: i18n('currentDepart', '当前用户所在部门'),
    type: 2
  }
]
// 获取人员得接口
export async function getUsers(params, store, extendQuery, method) {
  const { userInfo: kw, departId, groupId, pageIndex: pageNo, pageSize } = params
  const res = await store.getList(
    _.assign({}, { kw, departId, groupId, pageNo, pageSize, type: 1 }, extendQuery),
    method
  )
  const records = _.map(res.list, item => {
    const { id: userId, account, name: realname, mail: email, userDepartment: departs } = item
    return { userId, account, realname, email, departs }
  })
  return {
    records: records,
    pageNo: pageNo,
    pageSize: pageSize
  }
}
// 获取用户组接口
export async function getGroups(params, store, extendQuery, method) {
  const { name: kw, pageIndex: pageNo, pageSize } = params
  const res = await store.getList(
    _.assign({}, { kw, pageNo, pageSize, type: 0 }, extendQuery),
    method
  )
  const records = _.map(res.list, item => {
    const { id: groupId, name } = item
    return { groupId, name }
  })
  return {
    records: records,
    pageNo: pageNo,
    pageSize: pageSize,
    total: res.count
  }
}
// 自定义获取部门数据的接口
export async function getDeparts(params, store) {
  const { parent_depart_id } = params
  const res = await store.getList({ departId: parent_depart_id, type: 2 })
  const records = _.map(res.list, item => {
    const { id: departId, name, isLeaf } = item
    return { departId, name, pid: parent_depart_id, isLeaf }
  })
  return records
}
// 自定义搜索部门数据的接口
export async function getDepartList(params, store) {
  const { name } = params
  const res = await store.getList({ kw: name, type: 2 }, 'get')
  const records = _.map(res.list, item => {
    const { id: departId, name, isLeaf } = item
    return { departId, name, isLeaf }
  })
  return records
}

export function flatDeparts(currentDepart) {
  return currentDepart.reduce((arr, item) => {
    if (item.childrens) {
      return [...arr, item, ...flatDeparts(item.childrens)]
    }
    return [...arr, item]
  }, [])
}
