import { observable, action } from 'mobx'

export default class PendingTableStore {
  @observable priority = 0

  @observable pageSize = 10

  @observable current = 1

  @observable total = 0

  @observable lists = []

  @observable loading = false

  @action setPriority (value) {
    this.priority = value
    this.current = 1
  }

  @action setCurrent (page, pageSize) {
    this.current = page
    this.pageSize = pageSize
  }

  @action getTicketList (data) {
    const params = data || {
      pageSize: this.pageSize,
      current: this.current,
      priority: this.priority === 0 ? undefined : this.priority
    }
    this.loading = true
    axios.get(API.person_get_ticketList, {
      params: params
    }).then(res => {
      const lists = []
      const data = res ? res.list : []
      _.map(data, item => {
        if (item.children) {
          _.map(item.children, child => {
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
      this.loading = false
      this.lists = lists
      this.total = res ? res.count : 0
    })
  }

  @action distory () {
    this.priority = 0
    this.current = 1
    this.total = 0
    this.lists = []
  }
}
