import { observable, action } from 'mobx'
import { RemoveMatch } from '../../utils'
class SelectUser {
  @observable pageNum = 1

  @observable pageSize = 15

  @observable realName = ''

  @observable users = []

  @observable selectUsers = []

  @observable count = 0

  @action getUserList (data) {
    axios.get(API.query_users_without_org, { params: data }).then(res => {
      const newUsers = RemoveMatch(res.list, this.selectUsers, 'userId')
      this.users = newUsers
      this.count = res.count
    })
  }

  @action setPage (page) {
    this.pageNum++
  }

  @action setWd (value) {
    this.pageNum = 1
    this.realName = value
  }

  @action changeUserlistCheck (index, callback) {
    this.users[index].select = !this.users[index].select
    callback()
  }

  @action changeSelectUserlistCheck (index, callback) {
    this.selectUsers[index].select = !this.selectUsers[index].select
    callback()
  }

  @action addAll () {
    this.users.map(user => {
      user.select = false
      this.selectUsers.push(user)
    })
    this.users = []
  }

  @action add () {
    const newUser = []
    this.users.map(user => {
      if (user.select) {
        user.select = false
        this.selectUsers.push(user)
      } else {
        newUser.push(user)
      }
    })
    this.users = newUser
  }

  @action remove () {
    const newSelectUsers = []
    this.selectUsers.map(user => {
      if (user.select) {
        user.select = false
        this.users.push(user)
      } else {
        newSelectUsers.push(user)
      }
    })
    // this.users = RemoveMatch(this.users, this.selectUsers, 'userId')
    this.selectUsers = newSelectUsers
  }

  @action removeAll () {
    this.selectUsers.map(user => {
      user.select = false
      this.users.push(user)
    })
    this.selectUsers = []
  }

  @action closeUser (index) {
    const user = this.selectUsers[index]
    this.users.push(user)
    this.selectUsers.splice(index, 1)
  }

  @action setSelectUser (selectUsers) {
    this.pageNum = 1
    this.pageSize = 15
    this.realName = ''
    this.selectUsers = selectUsers
    this.getUserList({
      pageNum: this.pageNum,
      pageSize: this.pageSize,
      realName: this.realName
    })
  }
}

export default SelectUser
