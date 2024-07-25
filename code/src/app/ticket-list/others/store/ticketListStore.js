import { observable, action, runInAction } from 'mobx'
import { qs } from '@uyun/utils'

export default class TicketListStore {
  @observable ticketList = []

  // 工单列表
  @observable currentPattern = 'table'

  // 当前的模式
  @observable ticketCount = 0

  // 工单总数
  @observable loading = false

  @observable showLoadMore = false

  // 是否可以滚动加载
  @observable screenData = {
    current: 1,
    pageSize: 15,
    processId: '0'
  }

  @action getTicketList (data) {
    this.loading = true
    // processId为所有工单的时候不用传
    data.processId === '0' && delete data.processId
    axios({
      url: API.get_ticketList,
      method: 'get',
      params: data,
      paramsSerializer: params => qs.stringify(params, { indices: false })
    }).then(res => {
      const ticketList = []
      res.list.map(ticket => {
        if (ticket.children) {
          ticketList.push(...ticket.children)
        } else {
          ticketList.push(ticket)
        }
      })
      runInAction(() => {
        this.ticketCount = res.count
        if (this.currentPattern === 'card') {
          this.ticketList = [...this.ticketList, ...ticketList]
          this.showLoadMore = ticketList.length !== 0
        } else {
          this.ticketList = ticketList
        }
        this.loading = false
      })
    })
  }

  // 切换列表或者卡片模式
  @action switchCardOrTable (type) {
    this.currentPattern = type
  }

  // 筛选条件
  @action switchSceenData (data) {
    this.screenData = { ...this.screenData, ...data }
  }

  // 接单
  @action ticketReceive (data, status, callback) {
    let mes = ''
    axios({
      method: 'post',
      url: API.receiveTicket(data.ticketId),
      params: {
        tacheNo: data.tacheNo,
        tacheType: data.tacheType
      }
    }).then(() => {
      this.ticketList.map(ticket => {
        if (ticket.ticketId === data.ticketId) {
          ticket.status = 2
          mes = i18n('ticket.list.receiveSucess', '接单成功')
        }
      })
      callback(mes)
    })
  }

  // 催办
  @action ticketReminder (data, canRemind, callback) {
    let mes = ''
    axios.get(API.reminderTicket, {
      params: {
        id: data.ticketId
      }
    }).then(() => {
      this.ticketList.map(ticket => {
        if (ticket.ticketId === data.ticketId) {
          ticket.canRemind = 0
          mes = i18n('ticket.list.reminderSucess', '催办成功')
        }
      })
      callback(mes)
    })
  }

  // 关注
  @action ticketAttention (data, isAttention, processId, filterUrl, callback) {
    let mes = ''
    axios({
      method: 'post',
      url: API.attentionTicket(data.ticketId, isAttention, processId)
    }).then(() => {
      this.ticketList.map(ticket => {
        if (ticket.ticketId === data.ticketId) {
          ticket.isAttention = ticket.isAttention ? 0 : 1
          mes = ticket.isAttention === 1 ? i18n('ticket.list.attentioned', '已关注') : i18n('ticket.list.unattention', '取消关注')
        }
      })
      // 在我的关注的时候删除不是关注的工单
      if (filterUrl === 'myFollow') {
        this.ticketList = this.ticketList.filter(ticket => ticket.isAttention)
      }
      callback(mes)
    })
  }
};
