import { action, runInAction, toJS, observable } from 'mobx'

class RecordStore {
    @observable list = []

    @observable count = 0

    @observable SLADefinition = {}

    @observable queryData = {
      kw: undefined,
      current: 1,
      pageSize: 20
    }

    @action async getStrategyRecords (id) {
      const { current, pageSize, kw } = toJS(this.queryData)
      const data = {
        kw,
        id,
        page_num: current,
        page_size: pageSize
      }
      const res = await axios.get(API.get_strategy_records, { params: data }) || {}
      runInAction(() => {
        this.list = res.list || []
        this.count = res.total || 0
      })
    }

    @action async getStrategyRecordHeader (id) {
      const res = await axios.get(API.get_strategy_record_header, { params: { id } }) || {}
      runInAction(() => {
        this.SLADefinition = res
      })
    }

    @action resetQuery() {
      this.list = []
      this.queryData = {
        current: 1,
        pageSize: 20,
        kw: undefined
      }
      this.SLADefinition = {}
      this.count = 0
    }
}
export default new RecordStore()
