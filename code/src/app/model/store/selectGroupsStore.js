import { observable, action, toJS } from 'mobx'
import { RemoveMatch } from '../../utils'
class SelectGroup {
  @observable pageNum = 1

  @observable pageSize = 15

  @observable realName = ''

  @observable users = []

  @observable selectUsers = []

  @observable groups = []

  @observable selectGroups = []

  @observable count = 0

  @observable chechAll = false

    allGroups = []

  @action getGroupList () {
      axios.get(API.get_user_group).then(res => {
        const newGroups = RemoveMatch(res, toJS(this.selectGroups), 'groupId')
        this.groups = newGroups
        this.allGroups = res
      })
    }

  @action getUserList (data) {
    axios.get(API.query_users_without_org, { params: data }).then(res => {
      const newUsers = RemoveMatch(res.list, toJS(this.selectUsers), 'userId')
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
    const users = toJS(this.users)
    users[index].select = !users[index].select
    this.users = users
    callback()
  }

@action changeSelectUserlistCheck (index, callback) {
    const selectUsers = toJS(this.selectUsers)
    selectUsers[index].select = !selectUsers[index].select
    this.selectUsers = selectUsers
    callback()
  }

@action changeGrouplistCheck (index, callback) {
  const groups = toJS(this.groups)
  groups[index].select = !groups[index].select
  this.groups = groups
  this.chechAll = false
  callback()
}

  @action changeSelectGrouplistCheck (index, callback) {
  const selectGroups = toJS(this.selectGroups)
  selectGroups[index].select = !selectGroups[index].select
  this.selectGroups = selectGroups
  callback()
}

@action addAll () {
    const users = toJS(this.users)
    const groups = toJS(this.groups)
    const selectUsers = toJS(this.selectUsers)
    const selectGroups = toJS(this.selectGroups)

    const addUsers = _.map(users, user => {
      return _.assign({}, user, { select: false })
    })
    const addGroups = _.map(groups, group => {
      return _.assign({}, group, { select: false })
    })

    this.selectUsers = [...selectUsers, ...addUsers]
    this.selectGroups = [...selectGroups, ...addGroups]
    this.users = []
    this.groups = []
    this.chechAll = false
  }

@action add () {
  const users = toJS(this.users)
  const groups = toJS(this.groups)
  const selectUsers = toJS(this.selectUsers)
  const selectGroups = toJS(this.selectGroups)
  const addUsers = _.map(_.filter(users, user => user.select), user => {
    return _.assign({}, user, { select: false })
  })
  const addGroups = _.map(_.filter(groups, group => group.select), group => {
    return _.assign({}, group, { select: false })
  })
  this.selectUsers = [...selectUsers, ...addUsers]
  this.selectGroups = [...selectGroups, ...addGroups]
  this.users = _.filter(users, user => !user.select)
  this.groups = _.filter(groups, group => !group.select)
  this.chechAll = false
}

@action remove () {
  const users = toJS(this.users)
  const groups = toJS(this.groups)
  const selectUsers = toJS(this.selectUsers)
  const selectGroups = toJS(this.selectGroups)

  const addUsers = _.map(_.filter(selectUsers, user => user.select), user => {
    return _.assign({}, user, { select: false })
  })
  const addGroups = _.map(_.filter(selectGroups, group => group.select), group => {
    return _.assign({}, group, { select: false })
  })
  this.users = [...users, ...addUsers]
  this.groups = [...groups, ...addGroups]
  this.selectUsers = _.filter(selectUsers, user => !user.select)
  this.selectGroups = _.filter(selectGroups, group => !group.select)
}

@action removeAll () {
  const users = toJS(this.users)
  const groups = toJS(this.groups)
  const selectUsers = toJS(this.selectUsers)
  const selectGroups = toJS(this.selectGroups)

  const addUsers = _.map(selectUsers, user => {
    return _.assign({}, user, { select: false })
  })
  const addGroups = _.map(selectGroups, group => {
    return _.assign({}, group, { select: false })
  })

  this.users = [...users, ...addUsers]
  this.groups = [...groups, ...addGroups]
  this.selectUsers = []
  this.selectGroups = []
  this.chechAll = false
}

@action closeUser (index) {
  const selectUsers = toJS(this.selectUsers)
  const users = toJS(this.users)
  const user = selectUsers[index]
  this.users = [...users, user]
  this.selectUsers = [...selectUsers.slice(0, index), ...selectUsers(index + 1)]
}

@action closeGroup (index) {
  const selectGroups = toJS(this.selectGroups)
  const groups = toJS(this.groups)
  const group = selectGroups[index]
  this.groups = [...groups, group]
  this.selectGroups = [...selectGroups.slice(0, index), ...selectGroups(index + 1)]
}

@action chechAllGroup () {
  const groups = toJS(this.groups)
  this.groups = _.map(groups, group => {
    return _.assign({}, group, { select: !this.chechAll })
  })
  this.chechAll = !this.chechAll
}

@action setSelectUserAndGroup (data) {
  this.pageNum = 1
  this.pageSize = 15
  this.realName = ''
  this.selectUsers = data.userIds
  this.groups = RemoveMatch(toJS(this.allGroups), data.userGroups, 'groupId')
  this.selectGroups = data.userGroups
  this.getUserList({
    pageNum: this.pageNum,
    pageSize: this.pageSize,
    realName: this.realName
  })
}
}

export default SelectGroup
