import { action, runInAction, toJS, observable } from 'mobx'

class PolicyStore {
    @observable.ref list = []

    @observable.ref modelList = []

    @observable.ref queryData = {
      current: 1,
      pageSize: 20,
      kw: undefined,
      modelId: undefined
    }

    @observable count = 0

    @observable loading = false

    @action async getPolicyList () {
      this.loading = true
      const { current, pageSize, kw, modelId } = toJS(this.queryData)
      const data = {
        kw,
        page_size: pageSize,
        page_num: current,
        model_id: modelId
      }
      const res = await axios.get(API.getPolicyList, { params: data }) || {}
      runInAction(() => {
        this.loading = false
        this.list = res.strategy_list || []
        this.count = res.count || 0
      })
    }

    @action async changePolicyStatus (data) {
      const res = await axios.get(API.changePolicyStatus, { params: data })
      return res
    }

    @action async deletePolicyItem (data) {
      const res = await axios.get(API.deletePolicyItem, { params: data })
      return res
    }

    @action async getModelList () {
      const res = await axios.get(API.default_get_module) || []
      runInAction(() => {
        this.modelList = res
      })
    }

    @action resetQuery() {
      this.list = []
      this.queryData = {
        current: 1,
        pageSize: 20,
        kw: undefined,
        modelId: undefined
      }
      this.count = 0
      this.loading = false
    }
}
export default new PolicyStore()
