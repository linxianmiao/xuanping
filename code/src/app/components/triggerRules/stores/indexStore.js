import { observable, action, runInAction } from 'mobx'

class TriggerStore {
    @observable.ref allConditionList = []

    // 总的
    @observable.ref sectionConditionList = [] // 当前要使用的

    // 获取触发器的列表
    @action async getTriggerTypeList (modelId, excludeCodes, excludeVariable) {
      const res = await axios.get(API.queryConditionSelection, { params: { modelId } }) || []
      let sectionConditionList = _.filter(res, item => !_.includes(excludeCodes, item.code)) || []
      // 排除变量
      if (excludeVariable) {
        sectionConditionList = _.filter(sectionConditionList, item => item.type === 0)
      }
      runInAction(() => {
        this.allConditionList = res
        this.sectionConditionList = sectionConditionList
      })
      return sectionConditionList
    }

    @action async getComparsion (code, data) {
      const res = await axios.get(`${API.get_comparsion}/${code}`, { params: data })
      return res
    }

    @action async getNodesByModel (id) {
      const res = await axios.get(API.get_nodes_by_model, { params: { id } })
      return res
    }
}

export default new TriggerStore()
