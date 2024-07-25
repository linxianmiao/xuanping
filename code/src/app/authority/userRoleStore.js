import { action, runInAction, observable } from 'mobx'
import setProps from '~/utils/setProps'
// 权限的store
class UserRole {
  // 数据权限中某个角色下的权限
  @observable.ref dataTableList = {
    total: 0,
    list: []
  }

  // 数据权限中某个角色下的权限的筛选条件
  @observable.ref dataTableQuery = {
    roleId: undefined,
    kw: undefined,
    categoryCode: undefined,
    pageSize: 20,
    pageNo: 1
  }

  // 权限得类型列表
  @observable categoryCodeList = []

  // 当前数据权限授权得id
  @observable.ref selectedRowKeys = []

  @action async getListCategories() {
    const res = await axios.get(API.listCategories) || []
    runInAction(() => {
      this.categoryCodeList = res
    })
  }

  // 获取角色下权限列表
  @action async getDataTableList(query) {
    const res = await axios.get(API.listPermissionWithPage, { params: query }) || {}
    runInAction(() => {
      const { list } = res
      this.selectedRowKeys = _.chain(list)
        .filter(item => item.havePermission)
        .map(item => item.id)
        .value()
      this.dataTableList = res
    })
  }

  // 更新数据权限
  @action async updateRolePermission(roleId, data) {
    const res = await axios({
      url: API.updateRolePermission,
      method: 'post',
      params: { roleId },
      data: data
    })
    return res
  }

  @action setData = setProps(this)
}

export default new UserRole()