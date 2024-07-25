import { observable, action } from 'mobx'

class HeaderStore {
  @observable dataList = []

  @action getAllCount () {
    axios(API.default_get_count).then(res => {
      this.dataList = res || []
    })
  }
}

export default HeaderStore
