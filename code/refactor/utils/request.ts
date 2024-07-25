import { request as axios, __ } from '@uyun/utils'
import { message } from '@uyun/components'

const baseURL = '/itsm/api/v2'

const instance = axios.create({
  baseURL
})

instance.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  res => {
    if (res.config.url === '/tenant/api/v1/user/details/token') {
      return res
    }

    const { errCode } = res.data || {}

    if (errCode === 200) {
      return res
    } else if (errCode === 401 || errCode === 403) {
      window.location.href = '/tenant/'
    } else if (errCode) {
      message.error(__(`w${errCode}`), 1, () => {
        if (errCode === 2122) {
          window.location.href = '/itsm/'
        }
      })
    }

    return res
  },
  error => {
    const { status } = error.response

    switch (status) {
      case 401:
      case 403:
        window.location.href = '/tenant'
        break
      default:
        status && message.error(__(`w${status}`))
        break
    }

    return Promise.reject(error.response)
  }
)

interface AxiosRequest {
  method: 'get' | 'post' | 'put' | 'delete'
  url: string
  params?: any
  data?: any
}
export interface CustomReponse {
  data: any
  errCode: number
  message: string | null
}
const request = function(config: AxiosRequest) {
  return new Promise<CustomReponse>((resolve, reject) => {
    instance.request<CustomReponse>(config).then(res => {
      resolve(res.data)
    })
  })
}

const Ajax = {
  get: function(url: string, params?: any): Promise<CustomReponse> {
    return request({ method: 'get', url, params })
  },
  post: function(url: string, data?: object, params?: any): Promise<CustomReponse> {
    return request({ method: 'post', url, data, params })
  },
  put: function(url: string, data?: object, params?: any): Promise<CustomReponse> {
    return request({ method: 'put', url, data, params })
  },
  delete: function(url: string, data?: object, params?: any): Promise<CustomReponse> {
    return request({ method: 'delete', url, data, params })
  }
}

export default Ajax
