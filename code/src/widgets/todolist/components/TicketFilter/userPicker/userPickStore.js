import { action } from 'mobx'
import axios from '../../../api/request/common'
import * as API from '../../../api/api'

class UserPick {
  // 查询条件
  @action async getList(query, method) {
    if (method !== 'post') {
      delete query.form
    }
    const res =
      (await axios({
        url: method === 'post' ? API.queryActivityStaffList : API.queryStaffSelectionInfos,
        method: method || 'get',
        params: method === 'post' ? undefined : query,
        data: method === 'post' ? query : undefined
      })) || {}
    return res
  }

  // 获取筛选条件
  @action async getFilterList(data) {
    const res =
      (await axios({
        url: API.queryStaffSelectionInfos,
        method: 'get',
        params: data
      })) || {}
    return res.list || []
  }

  // 根据id获取用户列表
  @action async getUserList(ids, tab) {
    const res = (await axios.post(API.USER_LIST_NO_ORG, { ids: ids.join() })) || []
    if (_.includes(ids, 'currentUser')) {
      return [
        ..._.map(res, (item) => ({ id: item.userId, name: item.userName, type: Number(tab) })),
        { id: 'currentUser', type: Number(tab), name: i18n('currentUser', '当前用户') }
      ]
    }
    return _.map(res, (item) => ({ id: item.userId, name: item.userName, type: Number(tab) }))
  }

  // 获取部门id获取部门列表
  @action async getDepartList(departIds, tab) {
    const res =
      (await axios.get(API.queryDepartsByIds, { params: { departIds: departIds.join() } })) || []
    if (_.includes(departIds, 'currentDepart')) {
      return [
        ..._.map(res, (item) => ({ id: item.departId, name: item.name, type: Number(tab) })),
        {
          id: 'currentDepart',
          name: i18n('currentDepart', '当前用户所在部门'),
          type: 2
        }
      ]
    }
    return _.map(res, (item) => ({ id: item.departId, name: item.name, type: Number(tab) }))
  }

  // 根据用户组id获取用户组信息
  @action async getGroupList(groupIds, tab) {
    const res = (await axios.post(API.getGroupListByIds, { groupIds })) || []
    if (_.includes(groupIds, 'currentGroup')) {
      return [
        ..._.map(res, (item) => ({ id: item.groupId, name: item.groupName, type: Number(tab) })),
        {
          id: 'currentGroup',
          name: i18n('currentGroup', '当前用户所在组'),
          type: 0
        }
      ]
    }
    return _.map(res, (item) => ({ id: item.groupId, name: item.groupName, type: Number(tab) }))
  }

  // 根据矩阵id获取矩阵列
  @action async getMatrixRowList(data) {
    const res = (await axios.get(API.queryMatrixSelectionInfos, { params: data })) || []
    return res
  }

  @action async getUserById(id) {
    const res = await axios.get(API.GET_USER_BY_ID(id))
    return res
  }

  @action distory() {
    this.userList = [] // 人员列表
    this.groupList = [] // 用户组列表
    this.departmentList = [] // 部门列表
    this.roleList = [] // 角色列表
    this.rotaList = [] // 值班列表
    this.variableList = [] // 变量列表

    this.selectsList = []

    this.query = {
      1: { type: '1', kw: '', pageNo: 1, pageSize: 15, orderType: 0 }, // 代办工单排序 1===正序 0===倒叙
      0: { type: '0', kw: '', pageNo: 1, pageSize: 15 },
      2: { type: '2', kw: '' },
      3: { type: '3', kw: '' },
      4: { type: '4', kw: '' },
      5: { type: '5', pageNo: 1, pageSize: 10 }
    } // 查询条件
  }
}
export default new UserPick()
