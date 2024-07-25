import { observable, action, runInAction } from 'mobx'
import { qs } from '@uyun/utils'

class DraftStore {
  @observable list = []

  @observable counts = 0

  @observable query = {
    rows: 10,
    page: 0
  }

  @action async getList (query) {
    const res = await Axios.get(API.GETTICKETCRAFTS, query)
    runInAction(() => {
      this.list = res.data
      this.counts = res.total
    })
  }
}
export default new DraftStore()
