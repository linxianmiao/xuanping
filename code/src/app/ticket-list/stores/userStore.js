import { observable, action, runInAction } from 'mobx'
export default class UserListStore {
  @observable userList = []

  // 用户列表
  @observable departList = []

  // 部门列表
  @observable commentUserList = [] // 备注用户列表

  @action async getUserList (ids) {
    const data = await axios({
      url: API.USER_LIST_NO_ORG,
      method: 'post',
      data: ids ? { ids: ids.join() } : {}
    })
    this.userList = data
    return data.map(user => ({ id: user.userId, name: user.userName }))
  }

  @action async getCommentUserList (kw) {
    const data = await axios({
      url: API.listUsersWithPage,
      method: 'get',
      params: kw ? { kw: kw } : {}
    })
    this.commentUserList = data
    // return data.map(user => ({ id: user.userId, name: user.userName }))
  }

  @action async getDepartList () {
    const data = await axios.get(API.get_depart_list_tree)
    runInAction(() => {
      this.departList = data
    })
    return data
  }
}
