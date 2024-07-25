export const API = '/itsm/api/v2'

// 配置国际化
export const locale = [
  ['key', 'zh_CN', 'en_US'],
  ['message-ajax-local-exception', '返回数据解析错误', 'Return data parsing error'],
  ['message-ajax-server-unfound', '服务器资源未找到', 'Server resource not found'],
  ['message-ajax-server-error', '服务端异常', 'The service side abnormal'],
  ['message-ajax-authority', '无权限', 'No authority'],
  ['request-err', '请求错误', 'Request error'],
  ['input_keyword', '请输入关键字', 'Please enter keyword'],
  ['all', '全部', 'All'],
  ['my.collection', '我的收藏', 'My Collection'],
  ['collect.success', '收藏成功', 'Collect successfully'],
  ['collect.cancel.success', '取消收藏', 'Cencel collections'],
  ['pls_select_modelType', '请选择模型类型', 'Please select model type']
]

// axios.create(requestConfig)
export const requestConfig = {
  baseURL: API,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
}
