import request from './request'

/**
 * 请求后端接口
 * @param { appId }
 */
export function getInfo (params) {
  return request.get('/getInfo', params)
}
