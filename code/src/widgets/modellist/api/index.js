import request from './request'

/**
 * 查询模型分组
 */
export function queryModelGroups(params) {
  return request.get('/config/model/queryLayouts', { params })
}

/**
 * 查询模型类型
 */
export function queryModelTypes(params) {
  return request.get('/config/model/queryTypeList', { params })
}

/**
 * 查询模型
 */
export function queryModels(params) {
  return request.get('/ticket/getAuthModelsByUser', { params })
}

/**
 * 模型收藏/取消收藏
 */
export function collectModel(processId, collect) {
  return request.get(`/config/model/modelIsCollect/${processId}/${collect}`)
}

/**
 * 获取已选中模型
 */
export function querySelectedModels() {
  return request.get(`/config/model/queryModelMarked`)
}

/**
 * 保存选中的模型
 */
export function saveSelectedModels(modelIds) {
  return request.post(`/config/model/saveModelMarked`, modelIds)
}
