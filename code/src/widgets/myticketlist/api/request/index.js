import { request as axios } from '@uyun/utils'
import { notification } from '@uyun/components'
import { International } from '@uyun/everest-i18n'
import { locale, requestConfig } from './config'
function getCookie(name) {
  var value = '; ' + document.cookie
  var parts = value.split('; ' + name + '=')
  if (parts.length === 2) {
    return parts.pop().split(';').shift()
  }
}
// 防止提醒错误，出来许多
let notificationTimer = null
const { i18n } = new International({ locale, language: getCookie('language') || 'zh_CN' })

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  const error = new Error(response.statusText)
  error.response = response
  throw error
}

function catchError(error) {
  let message
  switch (error.response.status) {
    case 400:
    case 436:
      message = error.response.data.message || i18n('message-ajax-local-exception')
      break
    case 401:
      message = i18n('message-ajax-authority')
      break
    case 404:
      message = i18n('message-ajax-server-unfound')
      break
    case 500:
    case 502:
    case 503:
    case 504:
      message = i18n('message-ajax-server-error')
      break
    default:
      message = error.message
      break
  }
  clearTimeout(notificationTimer)
  notificationTimer = setTimeout(() => {
    notification.error({
      message: i18n('request-err'),
      description: message
    })
  }, 300)
  const err = error.response.data ? error.response.data : error.response
  return Promise.reject(err)
}

// 请求添加时间戳
function requestTime(config) {
  config.params = {
    _: new Date().getTime(),
    ...config.params
  }
  if (window.PROTAL_APP_KEY) {
    config.params.appkey = window.PROTAL_APP_KEY
  }

  return config
}

// 请求错误捕获
function requestCatchError(err) {
  return Promise.reject(err)
}

const request = axios.create(requestConfig)

request.interceptors.request.use(requestTime, requestCatchError)
request.interceptors.response.use(checkStatus, catchError)
request.interceptors.response.use((res) => {
  if (res.data.errCode === 200) {
    return res.data.data || '200'
  }
  return null
}, null)

export default request
