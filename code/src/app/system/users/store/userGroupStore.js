import { observable, action, runInAction } from 'mobx'
import { qs } from '@uyun/utils'

class UserMenuStore {
  @observable lists = []

  @observable active = ''

  @observable loading = false

  @observable pageNum = 1

  @observable pageSize = 10

  @observable wd = ''

  @observable users = {
    count: 0,
    list: []
  }

  // 用户组
  @action getUserGroup () {
    axios.get(API.get_user_group).then(res => {
      runInAction(() => {
        const groupId = !_.isEmpty(res) ? res[0].groupId : ''
        this.lists = res || []
        this.active = groupId
      })
    })
  }

  // 切换用户组
  @action onUserGroup (id) {
    this.active = id
    this.pageNum = 1
    this.wd = ''
  }

  // 关键字搜索
  @action setWd (value) {
    this.pageNum = 1
    this.wd = value
  }

  // 翻页
  @action setPage (page) {
    this.pageNum = page
  }

  // 删除用户组
  @action onDelete (id) {
    axios.post(API.del_group_name, qs.stringify({ groupId: id })).then(res => {
      this.getUserGroup()
    })
  }

  // 创建时校验用户组重名
  @action validatorName (value) {
    axios.get(API.get_group_name, { params: { groupName: value } }).then(res => {
      return res
    })
  }

  // 创建用户组
  @action onCreate (values) {
    const name = values.groupName
    axios.post(API.add_group_name, qs.stringify(values)).then(res => {
      axios.get(API.get_user_group).then(res => {
        const filter = _.filter(res, o => {
          return o.groupName === name
        })
        runInAction(() => {
          this.lists = res || []
          this.active = filter[0].groupId
        })
      })
    })
  }

  // 更新用户组名称
  @action onSave (value, id) {
    const data = qs.stringify({ groupId: id, groupName: value })
    axios.post(API.update_user_group, data).then(res => {
      this.getUserGroup()
    })
  }

  // 删除及添加后的刷新
  @action refresh () {
    if (this.pageNum === 1 && this.wd === '') {
      this.loading = true
      const data = {
        pageNum: 1,
        pageSize: 10,
        wd: '',
        groupId: this.active
      }
      axios.get(API.get_users_by_group_id, { params: data }).then(res => {
        runInAction(() => {
          this.users = res || {}
          this.loading = false
        })
      })
    } else {
      this.pageNum = 1
      this.wd = ''
    }
  }

  // 从用户组内单个移除用户
  @action removeUser (data) {
    const { userId, groupId } = data
    axios.post(`${API.remove_user_from_group}?groupId=${groupId}&userId=${userId}`).then(res => {
      this.refresh()
    })
  }

  // 用户组内批量移除用户
  @action multiRemoverUser (data) {
    axios.post(API.multi_remove_user_from_group, data).then(res => {
      this.refresh()
    })
  }

  // 获取用户组内的用户成员
  @action getUserByGroupId (data) {
    this.loading = true
    axios.get(API.get_users_by_group_id, { params: data }).then(res => {
      runInAction(() => {
        this.users = res || {}
        this.loading = false
      })
    })
  }

  // 组件销毁重置数据为初始化
  @action distory () {
    this.lists = []
    this.active = ''
    this.loading = false
    this.pageNum = 1
    this.pageSize = 10
    this.wd = ''
    this.users = {
      count: 0,
      list: []
    }
  }
}

export default UserMenuStore
