import axios from 'axios'
import { qs } from '@uyun/utils'
/**
 *
url：请求的URL地址
method: 请求方法
data 传参
 */
const request = async (url, method = 'get', data = {}) => {
  let param = {
    method: method,
    url: url
  }
  if (['get', 'delete'].includes(method?.toLowerCase())) {
    param.params = data
    param.paramsSerializer = (params) => qs.stringify(params, { indices: false })
  } else if (['post', 'put', 'patch'].includes(method?.toLowerCase())) {
    param.data = data
  }
  let list = axios({
    ...param
  })
    .then((res) => {
      return { type: 'success', data: res?.data?.data || undefined }
    })
    .catch((error) => {
      return {
        type: 'error',
        ...error
      }
    })

  return list
}

export { request }
