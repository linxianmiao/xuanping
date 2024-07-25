import { observable, action, toJS, runInAction } from 'mobx'
import { qs } from '@uyun/utils'
class TriggerListStore {
    @observable data = {
      pageNo: 1,
      pageSize: 20,
      kw: '',
      type: undefined
    }

    @observable list = []

    @observable count = 0

    @observable loading = false

    @action.bound setData (data) {
      this.data = data
      // this.getTriggerList()
    }

    @action async getTriggerList () {
      this.loading = true
      const res = await axios.get(API.getTriggerList, { params: toJS(this.data) })
      runInAction(() => {
        this.list = res.triggerDetailVoList || []
        this.count = res.count
        this.loading = false
      })
    }

    @action async delTrigger (id) {
      await axios.post(API.deleteTrigger(id))
      this.getTriggerList()
    }

    @action async changeStatusTrigger (data) {
      await axios.post(API.changeStatusTrigger, qs.stringify(data))
      this.getTriggerList()
    }

    @action resetQuery () {
      this.data = {
        pageNo: 1,
        pageSize: 20,
        kw: '',
        type: undefined
      }
      this.list = []
      this.count = 0
      this.loading = false
    }
}

export default new TriggerListStore()
