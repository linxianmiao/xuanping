import { action } from 'mobx'
import request from './api/request'
import { inject } from '@uyun/core'
export class UserPickStore {
  @inject('i18n') i18n

  // 查询条件
  @action async getList(query) {
    const res =
      (await request({
        url: '/user/query/queryStaffSelectionInfos',
        method: 'get',
        params: query
      })) || {}
    return res
  }

  // 获取筛选条件
  @action async getFilterList(data) {
    const res =
      (await request({
        url: '/user/query/queryStaffSelectionInfos',
        method: 'get',
        params: data
      })) || {}
    return res.list || []
  }

  // 根据id获取用户列表
  @action async getUserList(ids, tab) {
    const res =
      (await request.post('/config/userGroup/getUsersWithoutCarryOrg', { ids: ids.join() })) || []
    if (_.includes(ids, 'currentUser')) {
      return [
        ..._.map(res, (item) => ({ id: item.userId, name: item.userName, type: Number(tab) })),
        { id: 'currentUser', type: Number(tab), name: this.i18n('currentUser', '当前用户') }
      ]
    }
    return _.map(res, (item) => ({ id: item.userId, name: item.userName, type: Number(tab) }))
  }

  // 获取部门id获取部门列表
  @action async getDepartList(departIds, tab) {
    const res =
      (await request.get('/config/depart/queryDepartsByIds', {
        params: { departIds: departIds.join() }
      })) || []
    if (_.includes(departIds, 'currentDepart')) {
      return [
        ..._.map(res, (item) => ({ id: item.departId, name: item.name, type: Number(tab) })),
        {
          id: 'currentDepart',
          name: this.i18n('currentDepart', '当前用户所在部门'),
          type: 2
        }
      ]
    }
    return _.map(res, (item) => ({ id: item.departId, name: item.name, type: Number(tab) }))
  }

  // 根据用户组id获取用户组信息
  @action async getGroupList(groupIds, tab) {
    const res = (await request.post('/config/userGroup/getGroupListByIds', { groupIds })) || []
    if (_.includes(groupIds, 'currentGroup')) {
      return [
        ..._.map(res, (item) => ({ id: item.groupId, name: item.groupName, type: Number(tab) })),
        {
          id: 'currentGroup',
          name: this.i18n('currentGroup', '当前用户所在组'),
          type: 0
        }
      ]
    }
    return _.map(res, (item) => ({ id: item.groupId, name: item.groupName, type: Number(tab) }))
  }
}
