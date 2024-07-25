import { observable, action } from 'mobx'

class QueryerStore {
  @observable listData = []

  @observable.ref modelList = []

  // 模型列表
  @observable.ref modelAndTacheIdList = []

  // 所有工单选中的筛选项
  @observable.ref allField = {
    builtinFields: [],
    extendedFields: []
  } // 获取所有字段

  @action setData (data) {
    this.listData = data
  }

  @action async setDefaultHome (id) {
    const res = await axios.get(API.setDefaultHome, { params: { id: id } })
    return res
  }

  @action async getMenuList () {
    const res = await axios.get(API.getMenuList)
    this.listData = res
    // return res
  }

  @action menuChangeStatus (data) {
    axios.get(API.menuChangeStatus, { params: data })
      .then(() => {
        this.getMenuList()
      })
  }

  // 排序接口
  @action sortMenu () {
    axios.post(API.sortMenu, { menus: this.listData })
  }

  @action async batchDelete (data) {
    const res = await axios.post(API.batchDelete, data)
    return res
  }

  @action distory () {

  }
}

export default QueryerStore
