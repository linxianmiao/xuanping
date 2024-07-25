import { observable, action } from 'mobx'

class UserListStore {
  @observable pageNum = 1

  @observable pageSize = 10

  @observable wd = ''

  @observable data = {
    count: 0,
    list: []
  }

  @action getUserList (data) {
    axios.get(API.get_free_user, { params: data }).then(res => {
      this.data = res
    })
  }

  @action setPage (page) {
    this.pageNum = page
  }

  @action setWd (value) {
    this.pageNum = 1
    this.wd = value
  }

  @action addUserToGroup (data, callback) {
    axios.post(API.add_user_to_group, data).then(res => {
      callback()
    })
  }

  @action distory () {
    this.pageNum = 1
    this.pageSize = 10
    this.wd = ''
    this.data = {
      count: 0,
      list: []
    }
  }
}

export default UserListStore
