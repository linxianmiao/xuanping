import { action, runInAction, observable } from 'mobx'

function setDingAndWx(item) {
  switch (item.type) {
    case 'sendWechat': return { type: item.type, actionCode: item.type, name: '发送微信给用户' }
    case 'sendChatops': return { type: item.type, actionCode: item.type, name: '发送ChatOps消息' }
    case 'sendDingDing': return { type: item.type, actionCode: item.type, name: '发送钉钉给用户' }
    default : return item
  }
}
class EntrustStore {
  @observable.ref actionList = []

  // 获取委托列表
  @action.bound
  async getEntrustList (params) {
    const res = await axios.get(API.getMineList, { params })
    return res
  }

  // 新增委托
  @action.bound
  async addEntrust (data) {
    const res = await axios.post(API.addEnreust, data)
    return res
  }

  //更新委托
  async updateEntrust (data){
    const res = await axios.post(API.updateEntrust, data)
    return res
  }

  // 删除委托
  @action.bound
  async deleteEntrust (data) {
    const res = await axios.post(API.deleteEntrust, data)
    return res
  }

  // 取消委托
  @action.bound
  async cancelEntrust (data) {
    const res = await axios.post(API.cancelEntrust, data)
    return res
  }

  // 委托审核
  @action.bound
  async entrustCheck (params) {
    const res = await axios.post(API.entrustCheck, params)
    return res
  }

  // 委托审核
  @action.bound
  async getBaseActions () {
    if (_.isEmpty(this.actionList)) {
      const res = await axios.get(API.getActionList)
      runInAction(() => {
        this.actionList = _.chain(res).map(item => setDingAndWx(item)).filter(item => Boolean(item.actionCode)).value()
      })
    }
  }
}

export default new EntrustStore()
