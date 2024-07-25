import { observable, action, runInAction } from 'mobx'
import { store as runtimeStore } from '@uyun/runtime-react'

export default class CreatedTableStore {
  @observable pageSize = 10

  @observable loading = false

  @observable pageNum = 1

  @observable creator = [runtimeStore.getState().user?.userId]

  @observable filterType = 'all'

  @observable extParams = {}

  @observable lists = []

  @observable total = 0

  @action setPageNum(page, pageSize) {
    this.pageNum = page
    this.pageSize = pageSize
  }

  @action setFilterType(value) {
    this.filterType = value
    this.pageNum = 1
  }

  @action getAllTicket(data) {
    let params
    if (data) {
      params = data
    } else {
      const _data = {
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        creator: this.creator,
        extParams: this.extParams,
        filterType: 'myCreate'
      }
      params =
        this.filterType === 'all'
          ? _data
          : _.merge({}, _data, {
            filterType: 'myCreate',
            status: [this.filterType]
          })
    }
    this.loading = true

    axios.post(API.person_get_all_ticket, params).then(async (res) => {
      const lists = []
      const data = res ? res.list : []
      _.map(data, (item) => {
        if (item.children) {
          _.map(item.children, (child) => {
            child.isAttention = item.isAttention
            child.canRemind = item.canRemind
            child.rowId = _.uniqueId('person_table_')
            lists.push(child)
          })
        } else {
          item.rowId = _.uniqueId('person_table_')
          lists.push(item)
        }
      })
      const count = (await axios.post(API.tickList_count, params)) || 0

      runInAction(() => {
        this.lists = lists
        this.loading = false
        this.total = _.isNumber(count) ? count : 0
      })
    })
  }

  @action distory() {
    this.pageNum = 1
    this.filterType = 'all'
    this.total = 0
  }
}
