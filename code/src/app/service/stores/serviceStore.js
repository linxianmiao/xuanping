import { action, observable, runInAction } from 'mobx'

class Service {
  @observable serviceData = {}

  @observable firstActivity = {}

  @observable forms = {}

  @observable taches = []

  @observable processList = []

  @action async getSrvItems(id) {
    const res = await axios.get(API.get_srv_items, { params: { id } })
    runInAction(() => {
      this.serviceData = res
    })
    return res
  }

  @action async getServerFirstActivity(modelId) {
    const res = await axios.get(API.server_first_activity, { params: { id: modelId } })
    runInAction(() => {
      if (+res === 200) {
        this.firstActivity = {}
      } else {
        this.firstActivity = res
      }
    })
  }

  @action
  async getCreateTicket(modelId, params) {
    const res = await axios.get(API.intoCreateTicket(modelId), { params })

    // 去掉接口的fields，循环formLayoutVos获取全部数据
    let fields = []
    _.forEach(res.formLayoutVos, (d) => {
      if (d.type === 'group') {
        fields = [...d.fieldList, ...fields]
      } else {
        _.forEach(d.tabs, (tab) => {
          fields = [...fields, ...tab.fieldList]
        })
      }
    })
    res.fields = fields

    const obj = {
      modelId: res.modelId,
      isCreate: 1,
      ticketId: res.ticketId,
      tacheNo: +res.tacheNo || 0
    }
    const data = await axios({
      url: API.GET_FLOW_CHART,
      method: 'get',
      params: obj
      //   paramsSerializer: params => qs.stringify(params, { indices: false })
    })
    runInAction(() => {
      res.params = res.fields // 后端创建和流程中字段不一样，要特殊处理
      this.forms = res
      this.processList = data
    })
    return res
  }

  @action async getTache(modelId) {
    const res = await axios.get(API.TACHE(modelId))
    return res
  }

  @action async service_normal_create(data) {
    const res = await axios.post(API.SERVICENORMALCREATR, data)
    return res
  }

  @action async service_ticket_create(data) {
    const res = await axios.post(API.SERVICETICKETCREATE, data)
    return res
  }

  // 工单保存
  @action ticketSave(id, data) {
    return new Promise((resolve) => {
      axios.post(API.SAVETICKETCACHE(id), data).then((res) => {
        if (res === '200') {
          resolve('save')
        }
      })
    })
  }
}
export default Service
