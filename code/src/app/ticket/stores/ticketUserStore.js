import { observable, action, runInAction, toJS } from 'mobx'

class TicketUserStore {
  @observable.ref userList = []

  // 人员列表
  @observable.ref groupList = []

  // 用户组列表
  @observable.ref departmentList = []

  // 部门列表
  @observable.ref roleList = []

  // 角色列表
  @observable.ref rotaList = []

  // 值班列表
  @observable.ref variableList = []

  // 变量列表
  @observable.ref groupSelectUserList = []

  // 人员搜索用的用户组列表
  @observable.ref departSelectUsertList = [] // 人员搜索用的部门组列表

  @observable.ref selectUsers = []

  // 选中的人员
  @observable.ref selectGroups = []

  // 选中的用户组
  @observable.ref selectDepartments = []

  // 选中的部门
  @observable.ref selectRoles = []

  // 选中的角色
  @observable.ref selectRotas = []

  // 选中的值班
  @observable.ref selectVariables = [] // 选中的变量

  @observable.ref count = 0

  // 总数
  @observable.ref loadingType = 'replace'

  @observable.ref isUseVariable = false

  // 变量时候仅使用变量人员
  @observable.ref url = API.queryStaffSelectionInfos

  // 是否可以进行加载
  @observable.ref isLoads= {
    0: true,
    1: true,
    3: true,
    4: true
  }

  @observable.ref query = {
    1: { type: '1', kw: '', pageNo: 1, pageSize: 15, orderType: 0, groupId: undefined, departId: undefined }, // 代办工单排序 1===正序 0===倒叙
    0: { type: '0', kw: '', pageNo: 1, pageSize: 15 },
    2: { type: '2', kw: '' },
    3: { type: '3', kw: '' },
    4: { type: '4', kw: '' },
    5: { type: '5', pageNo: 1, pageSize: 10 }
  }

  // 获取筛选用户的组织和用户组的列表
  @action async getGroupOrDepartList (query) {
    const res = await axios({
      url: API.queryStaffSelectionInfos,
      method: 'get',
      params: query
    })
    runInAction(() => {
      const setList = (list, res) => this.loadingType === 'replace' ? res.list : [...list, ...res.list]
      switch (query.type) {
        case '0' : this.groupSelectUserList = setList(this.groupSelectUserList, res); break
        case '2' : this.departSelectUsertList = setList(this.departSelectUsertList, res); break
      }
    })
  }

  // 查询条件
  @action async getList (query, type = 'get') {
    const res = await axios({
      url: toJS(this.url),
      method: type,
      params: type === 'get' ? query : undefined,
      data: type !== 'get' ? query : undefined
    })
    runInAction(() => {
      this.count = res.count
      this.isLoads = _.assign({}, this.isLoads, { [query.type]: !_.isEmpty(res.list) })
      const setList = (list, res) => this.loadingType === 'replace' ? res.list : [...list, ...res.list]
      switch (`${query.type}`) {
        case '1' : this.userList = setList(this.userList, res); break
        case '0' : this.groupList = setList(this.groupList, res); break
        case '2' : this.departmentList = setList(this.departmentList, res); break
        case '3' : this.roleList = setList(this.roleList, res); break
        case '4' : this.rotaList = setList(this.rotaList, res); break
        case '5' : this.variableList = setList(this.variableList, res); break
      }
      if (_.isEmpty(this.groupSelectUserList) && query.type === '1') {
        // const newQuery = _.omit(query, ["departId","groupId","pageSize","pageNo","kw","orderType"])
        this.getGroupOrDepartList({ type: '0', pageSize: 2147483647 })
      }
    })
  }

  @action async setQuery (tab, query, type = 'replace') {
    this.query = { ...this.query, [tab]: query }
    this.loadingType = type
  }

  @action async setSelects (type, selects) {
    runInAction(() => {
      switch (`${type}`) {
        case '1' : this.selectUsers = selects; break
        case '0' : this.selectGroups = selects; break
        case '2' : this.selectDepartments = selects; break
        case '3' : this.selectRoles = selects; break
        case '4' : this.selectRotas = selects; break
        case '5' : this.selectVariables = selects; break
      }
    })
  }

  @action async setUseVariable (isUseVariable) {
    this.isUseVariable = isUseVariable
  }

  @action async setUrl (url) {
    this.url = url
  }

  @action distory () {
    this.userList = [] // 人员列表
    this.groupList = [] // 用户组列表
    this.departmentList = [] // 部门列表
    this.roleList = [] // 角色列表
    this.rotaList = [] // 值班列表
    this.variableList = [] // 变量列表
    this.selectUsers = [] // 选中的人员
    this.selectGroups = [] // 选中的用户组
    this.selectDepartments = [] // 选中的部门
    this.selectRoles = [] // 选中的角色
    this.selectRotas = [] // 选中的值班
    this.selectVariables = [] // 选中的变量
    this.count = 0 // 总数
    // this.groupId = null // 根据用户组选择人员
    // this.departId = null // 根据变量选择人员
    this.loadingType = 'replace'
    this.query = {
      1: { type: '1', kw: '', pageNo: 1, pageSize: 15, orderType: 0, groupId: undefined, departId: undefined }, // 代办工单排序 1===正序 0===倒叙
      0: { type: '0', kw: '', pageNo: 1, pageSize: 15 },
      2: { type: '2', kw: '' },
      3: { type: '3', kw: '' },
      4: { type: '4', kw: '' },
      5: { type: '5', pageNo: 1, pageSize: 10 }
    } // 查询条件
  }
}
export default TicketUserStore
