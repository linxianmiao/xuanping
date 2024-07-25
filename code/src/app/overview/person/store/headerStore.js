import { observable, action } from 'mobx'

class HeaderStore {
  @observable dataList = [0, 0, 0, 0]

  @action getOverdueCount () {
    axios(API.person_overdue).then(res => {
      this.dataList = res || []
    })
  }
}

export default HeaderStore
