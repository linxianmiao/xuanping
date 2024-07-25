import { observable, action, runInAction } from 'mobx'

class HandlePersonStore {
  @observable pageNum = 1

  @observable pageSize = 10

  @observable orderBy = 'todoCount'

  @observable orderType = '1'

  @observable isMore = true

  @observable isEnding = false

  @observable total = 0

  @observable data = []

  @action getUserTicket (data, isMore) {
    axios.get(API.default_user_ticket, { params: data }).then(res => {
      const { total, tableData } = res || {}
      const list = tableData || []
      runInAction(() => {
        this.total = total || []
        this.data = isMore ? this.data.concat(list) : list
        this.isEnding = !(list.length > 0)
      })
    })
  }

  @action setPageNum (page) {
    this.pageNum = page
    this.isMore = true
  }

  @action setFilter (sorter) {
    this.orderBy = !_.isEmpty(sorter) ? sorter.columnKey : 'todoCount'
    this.orderType = sorter.order === 'descend' ? '1' : '0'
    this.pageNum = 1
    this.isMore = false
  }

  @action destroy () {
    this.data = []
    this.pageNum = 1
    this.orderBy = 'todoCount'
    this.orderType = '1'
    this.isMore = true
    this.isEnding = false
    this.total = 0
  }
}

export default HandlePersonStore
