import { observable, action, runInAction } from 'mobx'

export default class TicketStore {
  @observable.ref detailForms = {}

  // 工单信息
  @observable.ref serviceData = {}

  // 获取工单详情
  @action.bound
  async getTicketDetail (ticket) {
    const ticketData = await axios({
      url: API.TICKETDETAIL(ticket.ticketId),
      method: 'get',
      params: { tacheNo: ticket.tacheNo, tacheType: ticket.tacheType, tacheId: ticket.tacheId, caseId: ticket.caseId }
    })

    const draftsData = await axios.get(API.GETTICKETCACHE(ticket.ticketId), {
      params: { tacheId: ticket.tacheId }
    })
    if (draftsData) {
      _.forEach(ticketData.formLayoutVos, item => {
        if (item.type === 'group') {
          _.forEach(item.fieldList, field => {
            _.forEach(draftsData.fieldCraftVos, item => {
              if (field.code === item.code) {
                field.defaultValue = item.value
              }
            })
          })
        } else {
          _.forEach(item.tabs, tab => {
            _.forEach(tab.fieldList, field => {
              _.forEach(draftsData.fieldCraftVos, item => {
                if (field.code === item.code) {
                  field.defaultValue = item.value
                }
              })
            })
          })
        }
      })
    }
    runInAction(() => {
      this.detailForms = ticketData
    })
    return ticketData
  }

  // 获取服务详情
  @action.bound
  async getTicketSrvcat (ticketId) {
    const res = await axios.get(API.GETTICKETSERVICE, { params: { id: ticketId } }) || {}
    runInAction(() => {
      this.serviceData = res
    })
  }

  @action.bound
  distory () {
    this.detailForms = {}
    this.serviceData = {}
  }
}
