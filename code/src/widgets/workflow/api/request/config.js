// 配置国际化
export const locale = [
  ['key', 'zh_CN', 'en_US'],
  ['message-ajax-local-exception', '返回数据解析错误', 'Return data parsing error'],
  ['message-ajax-server-unfound', '服务器资源未找到', 'Server resource not found'],
  ['message-ajax-server-error', '服务端异常', 'The service side abnormal'],
  ['message-ajax-authority', '无权限', 'No authority'],
  ['request-err', '请求错误', 'Request error']
]

// axios.create(requestConfig)
export const requestConfig = {
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
}
