import { action, runInAction, observable } from 'mobx'

class Definition {
  @observable sla = {}

  @observable timePolicyList = []

  @observable timePolicy = {}

  @observable loading = false

  // 获取服务时间策略
  @action async queryTimePolicy() {
    const res = await axios.get(API.query_time_policy)
    runInAction(() => {
      this.timePolicyList = res || []
    })
  }

  // 删除服务时间策略

  @action async deleteTimePolicy(id) {
    const res = await axios.get(API.timePolicy_delete, { params: { id } })
    this.queryTimePolicy()
    return res
  }

  // 获取SLA详情
  @action async getSLA(id) {
    this.loading = true
    const res = await axios.get(API.get_sla_definition_detail, { params: { id } })
    runInAction(() => {
      this.loading = false
      this.sla = res || {}
    })
  }

  @action async upDateSLA(data) {
    const res = await axios.post(API.update_sla_definition_detail, data)
    return res
  }

  @action async createSLA(data) {
    const res = await axios.post(API.create_sla_definition_detail, data)
    return res
  }

  @action async upDateTimePolicy(data) {
    const res = await axios.post(API.update_timePolicy, data)
    return res
  }

  @action async createTimePolicy(data) {
    const res = await axios.post(API.create_timePolicy, data)
    return res
  }

  @action distory() {
    this.sla = {}
  }
}
export default new Definition()
