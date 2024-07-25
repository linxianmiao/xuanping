
import { action, runInAction, observable } from 'mobx'

class BasicStore {
    @observable.ref modelList = []

    @observable.ref definitionList=[]

    // 时间字段，用于开始/结束条件
    @observable timeFields = []

    @action async getModelList () {
      const res = await axios.get(API.default_get_module) || []
      runInAction(() => {
        this.modelList = res
      })
    }

    @action async getDefinitionList () {
      const res = await axios.get(API.get_sla_definition_list) || {}
      runInAction(() => {
        this.definitionList = res.sla_list || []
      })
    }

    @action async queryTimeFields(modelId) {
      const res = await axios.get(API.queryModelFields, { params: { modelId, type: 'dateTime' } })

      runInAction(() => {
        this.timeFields = Array.isArray(res) ? res : []
      })
    }

    @action reset() {
      this.timeFields = []
    }
}
export default new BasicStore()
