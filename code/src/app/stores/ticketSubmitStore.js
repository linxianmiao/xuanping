import { observable, action, runInAction } from 'mobx'

export default class TicketSubmitStore {
  @observable.ref currentActivity = {}

  @action.bound
  async getActivityById(data) {
    const res = await axios.post(API.GET_ACTIVITY_BY_ID, data) || {}
    runInAction(() => {
      this.currentActivity = res
    })
    return res
  }

  // 工单提交
  @action.bound
  async ticketSubmit (data) {
    const res = await axios.post(API.TICKET_MOVE, data)
    if (res === '200') return 'submit'
    return false
  }

  @action.bound
  distory () {
    this.detailForms = {}
    this.serviceData = {}
  }
}
