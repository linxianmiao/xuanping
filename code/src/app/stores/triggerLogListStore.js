import { observable, action, runInAction } from 'mobx'

class TriggerLogListStore {
  @observable.ref data = {
    pageNo: 1,
    pageSize: 20,
    kw: undefined,
    startTime: undefined,
    endTime: undefined,
    triggerId: undefined,
    flowNo: undefined
  }

  @observable list = []

  @observable count = 0

  @observable loading = false

  @action setData(data) {
    this.data = data
  }

  @action async getAllTriggerRecord() {
    this.loading = true
    const res = await axios.get(API.getAllTriggerRecord, { params: this.data })
    runInAction(() => {
      this.list = res.triggerRecordVoList || []
      this.count = res.count
      this.loading = false
    })
  }

  @action async deleteTriggerRecord(data) {
    await axios.post(API.deleteTriggerRecord, data)
    this.getAllTriggerRecord()
  }

  @action resetQuery() {
    this.data = {
      pageNo: 1,
      pageSize: 20,
      kw: undefined,
      startTime: undefined,
      endTime: undefined,
      triggerId: undefined
    }
    this.list = []
    this.count = 0
    this.loading = false
  }
}

export default new TriggerLogListStore()
