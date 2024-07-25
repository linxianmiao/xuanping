import { action, runInAction, observable, toJS } from 'mobx'
import setProps from '~/utils/setProps'
import { formatUser, formatRole, filterAddUsers, getNewGroup } from './logic'
import * as R from 'ramda'

const pageSize = 10

export default class PermissionStore {
  @observable panels = []

  // 当前正在新建/编辑的用户组
  @observable.shallow currentPanel = null

  // 可添加的角色
  // [{appId, name, code, description, roles: [{roleId, appId, roleName, roleCode, roleType, type}]}]
  @observable addableRoleList = []

  @observable selectedRoleIds = []

  // 可关联的用户
  @observable.ref addableUserList = []

  @observable.ref selectedUsers = []

  @observable selectedGroups = []

  // 用户列表分页
  @observable pageIndex = 1

  // 加载更多，是否已经加载完毕
  @observable loadMore = false

  // 移除用户框的加载更多
  @observable loadMoreRemoveUser = false

  // 用来搜索用户
  @observable userKeyword = ''

  @observable loading = false

  // 展开的Collapse key
  @observable activeGroupIds = []

  // 权限自服务字段校验(不包括内部字段校验)
  @observable fieldValidateInfo = {
    validateStatus: 'success',
    help: ''
  }

  @action setProps = setProps(this)

  // 获取可添加的角色
  @action listGroupAddableRole = async () => {
    if (!this.currentPanel) return

    const { applicationId, appId, relatedRoles } = this.currentPanel
    const params = {
      groupId: applicationId,
      appId
    }
    const res = await axios.get(API.listGroupAddableRole, { params })

    runInAction(() => {
      const list = R.map(R.evolve({ roles: R.map((role) => formatRole(role, { type: 0 })) }))(res)
      this.addableRoleList = list
      this.selectedRoleIds = R.pluck('roleId', filterAddUsers(relatedRoles))
    })
  }

  // 查询可以关联的用户列表
  @action listGroupAddableUser = async (append = true) => {
    if (!this.currentPanel) return
    const params = {
      pageSize,
      pageIndex: this.pageIndex,
      kw: this.userKeyword,
      groupId: this.currentPanel.applicationId
    }
    this.loadMore = true
    this.loading = true
    const res = await axios.get(API.listGroupAddableUser, { params })
    runInAction(() => {
      if (!Array.isArray(res)) return
      // 查询接口返回的字段名与提交接口需要的字段名不一致，为了方便，以提交所需的名称为准
      const mappedRes = res.map((item) => formatUser(item, { type: 0 }))
      if (append) {
        this.addableUserList = [...this.addableUserList, ...mappedRes]
      } else {
        this.addableUserList = mappedRes
        this.selectedUsers = filterAddUsers(this.currentPanel.relatedUsers)
      }

      // 返回的数据条数小于pageSize说明所有数据都加载完毕了
      this.loadMore = res.length < pageSize ? 'finished' : false
      this.loading = false
    })

    return this.selectedUsers
  }

  // 添加新建的用户组
  @action
  addNewGroup = () => {
    // const group = getNewGroup(appId)
    const group = getNewGroup()

    this.panels.unshift(group)
    this.activeGroupIds.unshift(group.rowId)
  }

  @action
  addEditGroups = (groups = []) => {
    this.panels = groups.concat(toJS(this.panels))

    const ids = groups.map((item) => item.rowId)
    this.activeGroupIds = [...ids, ...this.activeGroupIds]
  }

  @action
  addSelectionGroup = (type) => {
    const nextPanels = [...this.panels]
    const group = getNewGroup()
    // 加入和退出用'join'，方便后端解析格式
    const value = 'join'

    group.type = type
    group.code = value
    group.name = value
    group.description = value
    group.applicationId = value

    nextPanels.unshift(group)
    this.panels = nextPanels
    this.activeGroupIds = this.activeGroupIds.concat(group.rowId)
  }
}
