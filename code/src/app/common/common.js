import { store as runtimeStore } from '@uyun/runtime-react'
import { International } from '@uyun/everest-i18n'
import axios from 'axios'
import { getCookie } from '../utils'
import { message } from '@uyun/components'
import _ from 'lodash'
import api from '../../assets/api'
import '@uyun/components/dist/index.css'
import '../../assets/styles/common.less'
import '../../assets/styles/editor/index.less'
// import '../../assets/styles/reset.less'
import locales from '../../assets/i18n.json'
import ajaxLocales from '../../assets/ajaxError.json'
import getURLParam from '../utils/getUrl'
// eslint-disable-next-line @typescript-eslint/no-var-requires
import querystring from 'qs'
// 为了兼容R18.14以前的表单脚本
window.USER_INFO = runtimeStore.getState().user
runtimeStore.on('change', () => {
  window.USER_INFO = runtimeStore.getState().user
})

window.language = getCookie('language') || 'zh_CN'

const intl = new International({
  language: window.language,
  locales: [locales, ajaxLocales]
})

const { i18n } = intl
window.i18n = i18n
window.API = api
window._ = _

const getParams = (query) => {
  if (typeof query !== 'string') {
    return undefined
  }
  const url = new URL(window.location.href)
  const searchParams = url.searchParams
  return searchParams.get(query)
}

const appkey = getURLParam('appkey') || getParams('appkey') || undefined

const request = axios.create()
request.interceptors.request.use(
  (config) => {
    config.params = {
      ...config.params,
      _t: new Date().getTime()
    }
    if (window.LOWCODE_APP_KEY) {
      config.params.appkey = window.LOWCODE_APP_KEY
    }
    if (appkey) {
      config.params.appkey = appkey
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
request.interceptors.response.use(
  (res) => {
    if (_.get(res, ['config', 'url']) === '/tenant/api/v1/user/details/token') {
      return res.data.data
    }
    if (_.get(res, ['config', 'url']).includes('asset/api/v1/equip/type/list')) {
      return res.data.data
    }

    if (_.get(res, ['config', 'url']).includes('/cmdb/serviceapi/v1')) {
      return res.data
    }
    const code = _.get(res, 'data.errCode')
    const data = _.get(res, 'data.data')
    if (code === 200) {
      if (_.isBoolean(data) || _.isNumber(data)) {
        return data
      } else {
        return data || '200'
      }
    } else if (_.includes([403, 401], code)) {
      window.location.href = '/tenant/'
    } else if (_.includes([3370], code)) {
      return code
    } else if (code) {
      const messageNotify =
        (code >= 3349 && code <= 3354) || code === 3336 ? message.warning : message.error
      messageNotify(i18n(`w${code}`), 6, () => {
        if (code === 2122) {
          window.location.href = '/itsm/'
        }
      })
      // 当itsm页面作为iframe嵌入别的产品时，由于弹框高度小，报错提示会滚走，看不到。所以需要按底部定位报错提示
      const messageDom = document.getElementsByClassName('u4-message')
      if (messageDom[0] && window.parent !== window) {
        messageDom[0].style.top = 'auto'
        messageDom[0].style.bottom = '100px'
      }
      window.ITSM_ERR_CODE = code
      return null
    }
  },
  (error) => {
    console.error('接口报错error', error)
    const status = error.response && error.response.status
    switch (status) {
      case 400:
        message.error(i18n('w400', '非法请求'), 6)
        const messageDom = document.getElementsByClassName('u4-message')
        if (messageDom[0] && window.parent !== window) {
          messageDom[0].style.top = 'auto'
          messageDom[0].style.bottom = '100px'
        }
        break
      case 401:
      case 403:
        window.location.href = '/tenant/'
        break
      default:
        status && message.error(i18n(`w${status}`), 6)
        const messageDom2 = document.getElementsByClassName('u4-message')
        if (messageDom2[0] && window.parent !== window) {
          messageDom2[0].style.top = 'auto'
          messageDom2[0].style.bottom = '100px'
        }
        return false
    }
  }
)

window.axios = request
