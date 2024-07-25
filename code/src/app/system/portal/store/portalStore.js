import { observable, action } from 'mobx'
import { qs } from '@uyun/utils'

class PortalStore {
  @observable suffix = ''

  @action getUserSuffix (callback) {
    axios.get(API.get_suffix).then(res => {
      if (res && +res !== 200) {
        this.suffix = res || ''
      } else {
        callback && callback()
      }
    })
  }

  @action updateUserSuffix (data, callback) {
    axios.post(API.save_suffix, qs.stringify(data)).then(res => {
      if (+res === 200) {
        this.getUserSuffix()
        callback()
      }
    })
  }
}

export default PortalStore
