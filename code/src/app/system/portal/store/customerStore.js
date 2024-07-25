import { observable, action, runInAction } from 'mobx'
import { qs } from '@uyun/utils'

class CustomerStore {
  @observable loading = false

  @observable data = []

  @observable user = null

  @observable count = 0

  @observable pageNum = 1

  @observable pageSize = 10

  @observable wd = ''

  @action onPage (page) {
    this.pageNum = page
  }

  @action onWd (value) {
    this.pageNum = 1
    this.wd = value
  }

  @action updateStatus (data) {
    axios.post(API.update_customer_status, qs.stringify(data)).then(res => {
      const data = {
        pageNum: this.pageNum,
        pageSize: 10,
        wd: this.wd
      }
      this.getUserList(data)
    })
  }

  @action onRefresh () {
    if (this.pageNum === 1) {
      const data = {
        pageNum: 1,
        pageSize: 10,
        wd: this.wd
      }
      this.getUserList(data)
    } else {
      this.pageNum = 1
    }
  }

  @action onCreate (data, callback) {
    axios.post(API.create_customer, data).then(res => {
      this.onRefresh()
      callback()
    })
  }

  @action onDelete (data) {
    axios.post(API.delete_customer, qs.stringify(data)).then(res => {
      this.onRefresh()
    })
  }

  @action onDetail (data, callback) {
    axios.get(API.detail_customer, { params: data }).then(res => {
      this.user = res || null
      callback()
    })
  }

  @action onUpdate (data, callback) {
    axios.post(API.update_customer, data).then(res => {
      const data = {
        pageNum: this.pageNum,
        pageSize: 10,
        wd: this.wd
      }
      this.getUserList(data)
      callback()
    })
  }

  @action getUserList (data) {
    this.loading = true
    axios.get(API.get_customer, { params: data }).then(res => {
      const data = res || {}
      const { list, count } = data
      runInAction(() => {
        this.loading = false
        this.data = list
        this.count = count
      })
    })
  }

  @action onClearUser (cb) {
    this.user = null
    cb()
  }

  @action distory () {
    this.loading = false
    this.data = []
    this.user = null
    this.count = 0
    this.pageNum = 1
    this.pageSize = 10
    this.wd = ''
  }
}

export default CustomerStore
