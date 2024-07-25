import request from './request'
import { qs } from '@uyun/utils'
import axios from 'axios'
// 待办，参与 ，关注 工单列表
export function getTicketList(data) {
  return request({
    url: '/ticket/getTicketList',
    method: 'get',
    params: data,
    paramsSerializer: (params) => qs.stringify(params, { indices: false })
  })
}

// 审批工单列表
export function getTicketListwithAllApps(data) {
  return request({
    url: 'ticket/getTicketListwithAllApps',
    method: 'get',
    params: data,
    paramsSerializer: (params) => qs.stringify(params, { indices: false })
  })
}

export function getTicketListWithAllApps(data) {
  return request({
    url: 'ticket/getTicketListWithAllApps',
    method: 'get',
    params: data,
    paramsSerializer: (params) => qs.stringify(params, { indices: false })
  })
}

//我的关注
export function getFollowTicketList(data) {
  return axios({
    url: '/itsmutil/frontapi/v1/classifyTicket/query',
    method: 'get',
    params: data,
    paramsSerializer: (params) => qs.stringify(params, { indices: false })
  })
}

// 可以创建的模型列表
export function getModelInLayoutByUser() {
  return request.get('/ticket/getModelInLayoutByUser')
}
// 所有工单列表
export function getALLTicketList(data) {
  return request({
    url: '/ticket/getAllTicketWithAllApps',
    method: 'post',
    data: data
  })
}

// 所有工单列表总数
export function getALLTicketListCount(data) {
  return request({
    url: '/ticket/getAllTicket/countWithAllApps',
    method: 'post',
    data: data
  })
}

// 个待加组待列表
export function getTodoTicketList(data) {
  return request({
    url: '/ticket/getMyGroupToDoAllTicket',
    method: 'post',
    data: data
  })
}
//  个待加组待列表列表总数
export function getTodoTicketListCount(data) {
  return request({
    url: '/ticket/getAllTicket/myGroupToDocount',
    method: 'post',
    data: data
  })
}

// tab页查询总数
export function getTabCount() {
  return request.get('/ticket/getMyGroupToDoFilterType')
}

// 关注操作
export function attentionTicket(ticketId, status, modelId) {
  return request.post(`/ticket/attention/${ticketId}/${status}/${modelId}`)
}

// 查询菜单
export function queryPortalMenus(name) {
  return request.get('/config/depart/queryPortalMenus', { params: { menuType: name } })
}

// 人员组件
export function queryStaffSelectionInfos(data) {
  return request.get('/user/query/queryStaffSelectionInfos', { params: data })
}
// 根据id获取人员详细信息
export function getUsersWithoutCarryOrg(ids) {
  return request.post('/config/userGroup/getUsersWithoutCarryOrg', { ids: ids.join() }) || []
}

// 编辑portal内容
export function editPortalMenus(data) {
  return request.post('/config/depart/editPortalMenus', data) || []
}
// // 获取portal编辑内容
// export function queryPortalMenus (data) {
//   return request.get('/config/depart/queryPortalMenus', { params: { data } }) || []
// }

// 我的草稿
export function getTicketCrafts(params) {
  return request.get('/ticket/getAllAppTicketCrafts', { params })
}

// 删除草稿
export function deleteTicketCache(id) {
  return request.get(`/ticket/deleteTicketCache/${id}`)
}

// 获取导出进度
export function getExportProgress(exportId) {
  return request.get(`/ticket/getExportProgress`, { params: { exportId } })
}

export function EXPORT(data) {
  return request.post(`/ticket/export`, data)
}

//获取当前人员所属部门
export function getUserSupDept() {
  return request.get(`/ticket/getUserSupDept`)
}

//根据code获取字段详情
export function queryFieldDetailsByCodes(params) {
  return request.get(`/config/field/queryFieldDetailsByCodes`, { params })
}
