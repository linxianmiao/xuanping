import { action, observable, runInAction } from 'mobx'
import api from '../api/api'
import { request } from '../../utils'

export default class TicketListStore {
  @observable.ref
  itsmProps = {}

  @observable.ref
  selectedList = []

  @observable.ref
  allTicketListData = []

  @observable
  total = 0

  @observable
  allTicketListLoading = false

  @observable
  listModalVisible = false

  @observable.ref
  searchParams = {
    pageNum: 1,
    pageSize: 10,
    filterType: 'all',
    wd: undefined,
    extParams: {}
  }

  /**
   * 将工单信息，表单相关方法存入store
   * @param props
   */
  @action.bound
  setItsmProps(props) {
    this.itsmProps = props
  }

  @action.bound
  async getAllTicketListData() {
    this.allTicketListLoading = true
    const res = await request.post(api.getAllTicket, this.searchParams)
    const count = await request.post(api.getAllTicketCount, this.searchParams)
    this.allTicketListLoading = false
    runInAction(() => {
      if (res) {
        console.log(res)
        this.allTicketListData = res.list
        this.total = _.isNumber(count) ? count : 0
      }
    })
  }

  @action.bound
  changeSearchParams(obj) {
    this.searchParams = { ...this.searchParams, ...obj }
    if (obj.wd) {
      return false
    }
    this.getAllTicketListData()
  }

  @action.bound
  kwSearch() {
    this.changeSearchParams({ pageNum: 1 })
  }

  @action.bound
  toggleListModalVisible() {
    this.listModalVisible = !this.listModalVisible
  }

  @action.bound
  addItem(record) {
    if (!Array.isArray(record)) {
      record = [record]
    }
    this.selectedList = this.selectedList.concat(record)
    this.itsmProps.onChange && this.itsmProps.onChange(this.selectedList)
  }

  @action.bound
  async removeItem(record) {
    if (this.savedRelatedTicketCodes.includes(record.ticketId)) {
      const postData = {
        srcId: this.itsmProps.forms.ticketId,
        destId: record.ticketId
      }
      await request.get(api.DEL_RELATIONSHIP, { params: postData })
      this.selectedList = this.selectedList.filter((item) => item.ticketId !== record.ticketId)
      this.itsmProps.onChange && this.itsmProps.onChange(this.selectedList)
    } else {
      this.selectedList = this.selectedList.filter((item) => item.ticketId !== record.ticketId)
      this.itsmProps.onChange && this.itsmProps.onChange(this.selectedList)
    }
  }

  @action.bound
  resetStore() {
    this.searchParams = {
      pageNum: 1,
      pageSize: 10,
      filterType: 'all',
      wd: undefined,
      extParams: {}
    }
    this.selectedList = []
    this.allTicketListData = []
    this.total = 0
  }

  @action.bound
  async getSavedRelatedTicket(ticketId) {
    const res = await request.get(api.GET_RELATE_TICKET, { params: { ticketId } })
    runInAction(() => {
      let savedRelatedTicketCodes = []
      if (Array.isArray(res) && res.length > 0) {
        savedRelatedTicketCodes = res.map((d) => d.id)
      }
      this.savedRelatedTicketCodes = savedRelatedTicketCodes
    })
  }
}
