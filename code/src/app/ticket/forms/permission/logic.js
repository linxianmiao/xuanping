import uuid from '~/utils/uuid'
import * as R from 'ramda'

export function getGroupId(group) {
  return group.groupId || group.applicationId || group.id
}

export function validateUsersEmpty(users) {
  if (!users || users.length === 0) {
    return {
      validateStatus: 'error',
      help: i18n('please.select.user', '请选择用户')
    }
  } else {
    return {
      validateStatus: 'success',
      help: ''
    }
  }
}

export function validateGroupsEmpty(groups) {
  if (!groups || groups.length === 0) {
    return {
      validateStatus: 'error',
      help: i18n('globe.selectUserGroup', '请选择用户组')
    }
  } else {
    return {
      validateStatus: 'success',
      help: ''
    }
  }
}

export function validateName(name) {
  if (_.isEmpty(name)) {
    return {
      validateStatus: 'error',
      help: i18n('name.empty.error')
    }
  } else {
    return {
      validateStatus: 'success',
      help: ''
    }
  }
}

export function validateCode(code) {
  if (_.isEmpty(code)) {
    return {
      validateStatus: 'error',
      help: i18n('code-cannot-empty', '编码不能为空')
    }
  }
  const reg = /^[a-zA-Z\d_]+$/
  if (!reg.test(code)) {
    return {
      validateStatus: 'error',
      help: i18n('code-reg-error', '编码只能包含字母、数字、下划线')
    }
  }
  return {
    validateStatus: 'success',
    help: ''
  }
}

export function validateApp(appId) {
  if (_.isEmpty(appId)) {
    return {
      validateStatus: 'error',
      help: i18n('please.select.app', '请选择应用')
    }
  } else {
    return {
      validateStatus: 'success',
      help: ''
    }
  }
}

// 为了业务自行扩展的字段，仅在前端使用，不会传给后端
export function getCustomGroupData() {
  return {
    userList: [],
    roleList: [],
    nameInfo: { validateStatus: 'success', help: '' },
    codeInfo: { validateStatus: 'success', help: '' },
    appInfo: { validateStatus: 'success', help: '' },
    usersInfo: { validateStatus: 'success', help: '' },
    groupsInfo: { validateStatus: 'success', help: '' }
  }
}

// 新建用户组时的默认字段
export function getNewGroup(appId) {
  return {
    // 添加group时，用id作key，以没有applicationId来判断这是个新增用户组
    rowId: uuid(),
    // applicationId: uuid(),
    appId,
    name: '',
    code: '',
    description: '',
    relatedRoles: [],
    relatedUsers: [],
    relatedGroups: [],
    // 权限申请项类型 0:申请新增 1：申请编辑 2：申请删除 3：申请加入 4：申请退出
    type: 0,
    // 0：待提交 1：待审批 2”已生效 3：已驳回
    status: 0,
    ...getCustomGroupData()
  }
}

// 把全局用户组接口返回的数据格式化为前端需要的结构
// 打开编辑用户组弹框时使用
export function fortmatGroup(group, others = {}) {
  const { appId, groupId, name, code, description } = group
  return {
    ...others,
    rowId: uuid(),
    applicationId: groupId,
    appId,
    name,
    code,
    description,
    relatedUsers: [],
    relatedRoles: [],
    status: 0,
    ...getCustomGroupData()
  }
}

// 格式化用户
export function formatUser(user, others = {}) {
  return {
    ...others,
    userId: user.userId,
    userAccount: user.account,
    userName: user.realname,
    userEmail: user.email
  }
}

// 格式化角色
export function formatRole(role, others = {}) {
  const { roleId, appId, name, code, roleType } = role
  return {
    ...others,
    roleId,
    appId,
    roleName: name,
    roleCode: code,
    roleType
  }
}

export function findGroupById(groups, rowId) {
  return groups.find((group) => group.rowId === rowId)
}

export function flatRoleList(roleList) {
  return roleList.reduce((acc, item) => [...acc, ...item.roles], [])
}

// 根据关键字过滤角色列表
export function filterRoleList(roleList, keyword) {
  const list = []
  for (const item of roleList) {
    const roles = item.roles.filter((role) => role.roleName.includes(keyword))
    if (roles.length > 0) {
      list.push({ ...item, roles })
    }
  }
  return list
}

// 过滤出新增的用户或角色
export function filterAddUsers(users) {
  return users.filter((user) => user.type === 0)
}

// 过滤出删除的用户或角色
export function filterRemoveUsers(users) {
  return users.filter((user) => user.type === 1)
}

// 角色列表是分组的，需要先flat再过滤
export function findRolesByIds(roles, ids) {
  const allRoles = roles.reduce((acc, item) => [...acc, ...item.roles], [])
  return allRoles.filter((role) => ids.includes(role.roleId))
}

// type   权限申请项类型 0:申请新增 1：申请编辑 2：申请删除 3：申请加入 4：申请退出
// status  0：待提交 1：待审批 2”已生效 3：已驳回
// 根据申请类型和申请状态，计算可以显示的状态是撤销、删除 还是 撤销删除
export function calcDelStatus(type, status) {
  if (status === 0 || status === 1) {
    // 申请新增返回1 代表可以显示撤销
    // if (type === 0) return 1
    // 申请编辑返回2，代表可以申请删除
    if (type === 1) return 2
    // 申请删除返回3，表示可以撤销删除
    if (type === 2) return 3
    // 其他情况返回-1，表示不在处理范围之内
    return -1
  } else {
    // 啥都不显示
    return 0
  }
}

// 获取当前展开的用户组ID
// 待提交的要展开，申请新增和编辑的要展开，申请删除的默认关闭，其他不考虑
export function getActiveGroupIds(adminGroups) {
  const groups = adminGroups.filter((group) => {
    const { type, status } = group
    if (status === 0) return true
    if (type === 0 || type === 1) return true
    return false
  })
  return groups.map((group) => group.rowId)
}

// 获取一组用户组已经关联的用户和角色
export async function getUserAndRoleList(groups) {
  const promises = groups.map(async (group) => {
    const params = { groupId: group.applicationId }
    const [userRes, roleRes] = await Promise.all([
      axios.get(API.listUsersByGroupId, { params }),
      axios.get(API.listRolesByGroupId, { params })
    ])
    return {
      ...group,
      page: 1,
      userListCount: userRes ? userRes.count : 0,
      loadMoreRemoveUser:
        userRes && userRes.list && userRes.list.length < userRes.count ? false : 'finished',
      userList: (userRes ? userRes.list : []).map((item) => formatUser(item, { type: 1 })),
      roleList: R.map(R.evolve({ roles: R.map((role) => formatRole(role, { type: 1 })) }))(roleRes)
    }
  })
  return Promise.all(promises)
}

// 用来处理表单处于只读状态时，显示字段的新旧数据变化状态
export function getFormItemDiffStatus(value, originalValue, type) {
  // 如果是申请删除就在item上显示状态了，因为panel的头上已经有删除标识了
  if (type === 2) return null
  if (typeof originalValue === 'undefined' || originalValue === null) {
    return ['+', 'add']
  }
  if (value !== originalValue) {
    return ['*', 'modify']
  }
  return null
}

export const userModalColumns = [
  {
    dataIndex: 'userAccount',
    title: i18n('account', '账号')
  },
  {
    dataIndex: 'userName',
    title: i18n('nickname', '昵称')
  },
  {
    dataIndex: 'userEmail',
    title: i18n('email', '邮箱')
  }
]

// 用来处理用户组header上显示的状态
// 数字与用户组的权限申请类型type一致
export const GROUP_OPER_STATUS = {
  0: ['+', 'add'],
  1: ['*', 'modify'],
  2: ['-', 'delete']
}
