import { request as axios } from '@uyun/utils'
import { getUrl } from './utils'

const request = axios.create({
  baseURL: '/itsm/api/v2'
})
request.interceptors.request.use(
  (config) => {
    config.params = {
      ...config.params,
      _t: new Date().getTime()
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
request.interceptors.response.use(
  (res) => {
    const code = res.data.errCode
    if (code === 200) {
      // 坑呀，才发现后端有的data为false的
      if (Object.prototype.toString.call(res.data.data) === '[object Boolean]') {
        return res.data.data
      } else if (typeof res.data.data === 'number') {
        return res.data.data
      } else {
        return res.data.data ? res.data.data : '200'
      }
    } else if (code === 403) {
      if (getUrl('source') === 'sloth') {
        if (window.location.hash.indexOf('#/login') === -1) {
          window.location.href = '#/login'
        }
      } else {
        window.location.href = '/tenant/'
      }
    } else {
      // message.error(i18n(`w${code}`), 1, () => {
      //   if (code === 2122) {
      //     window.location.href = '/itsm/'
      //   }
      // })
      window.ITSM_ERR_CODE = code
      return null
    }
  },
  (error) => {
    const status = error.response.status
    switch (status) {
      case 400:
        // message.error(i18n('w400', '非法请求'))
        break
      case 401:
        if (getUrl('source') === 'sloth') {
          if (window.location.hash.indexOf('#/login') === -1) {
            window.location.href = '#/login?source=sloth'
          }
        } else {
          window.location.href = '/tenant/#/login_admin'
        }
        break
      case 403:
        if (getUrl('source') === 'sloth') {
          if (window.location.hash.indexOf('#/login') === -1) {
            window.location.href = '#/login?source=sloth'
          }
        } else {
          window.location.href = '/tenant/'
        }
        break
      default:
        // message.error(i18n(`w${status}`))
        break
    }
  }
)

export default request
