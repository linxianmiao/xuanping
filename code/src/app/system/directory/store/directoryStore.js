import { observable, action, toJS } from 'mobx'

class dictoryStore {
    // 变更目录数据
    @observable dirList = []

    // 上级分类目录
    @observable.ref parentGroupList = []

    // 子流程列表
    @observable.ref subModelList = []

    // 组织机构树
    @observable departList = []

    // 当前所选组织
    @observable currentOrg = {}

    // 父级目录
    @observable.ref parentDirList = []

    // 关联流程
    @observable.ref relatedProcessList = []
    // 模糊搜索吼的搜索

    @observable.ref searchItemList = []

    @observable kw = undefined

    // @observable orgKw = undefined

    @observable.ref pageNum = 0

    @observable.ref pageSize = 10

    @action setParentGroupList(data) {
      this.parentGroupList = data
    }

    @action async setOrgKw(value) {
      // this.orgKw = value
      const res = await axios.get(API.getDepartList, { params: { parentId: '0', kw: value } })
      this.departList = res
    }

    @action async get_model_list() {
      const data = {
        pageSize: 2147483647,
        filterUsable: true,
        modelType: 1
      }
      const res = await axios.get(API.get_model_list, { params: data })
      this.subModelList = res.list
    }

    @action async saveDirectory(data = {}) {
      const res = await axios.post(API.saveDirectory, data)
      this.getDirList()
      return res
    }

    @action async deleteDirectory(id) {
      const res = await axios.get(API.deleteDirectory, { params: { id: id } })
      this.getDirList()
      return res
    }

    @action async directoryChangeStatus (data) {
      const res = await axios.get(API.directoryChangeStatus, { params: data })
      if (res === '200') {
        this.getDirList()
      }
    }

    @action async setDirList(data) {
      this.dirList = data
    }

    @action async getParentGroupList(data) {
      const defaultData = {
        departId: this.currentOrg.departId
      }
      const res = await axios.get(API.getDirectoryList, { params: data || defaultData })
      if (data && data.superiorCode) {
        const parentGroupList = toJS(this.parentGroupList)
        this.parentGroupList = this.loopData(parentGroupList, data.superiorCode, res)
      } else {
        this.parentGroupList = res
      }
      return res
    }

    @action async getDirList(data) {
      const params = {
        ...data,
        departId: this.currentOrg.departId
      }
      const res = await axios.get(API.getDirectoryList, { params: params })
      if (params && params.superiorCode) {
        const dirList = toJS(this.dirList)
        this.dirList = this.loopData(dirList, params.superiorCode, res)
      } else {
        this.dirList = res
      }
      return res
    }

    @action async getDepartList(parentId) {
      const res = await axios.get(API.getDepartList, { params: { parentId } })
      if (parentId === '0') {
        this.departList = res
        this.currentOrg = res[0]
      } else {
        const departList = toJS(this.departList)
        this.departList = this.loopData(departList, parentId, res)
      }
      return res
    }

    loopData(data, pCodeorDid, res) {
      return _.map(data, depart => {
        if (depart.children && depart.children.length > 0) {
          this.loopData(depart.children, pCodeorDid, res)
        } else if (depart.code === pCodeorDid || depart.departId === pCodeorDid) {
          depart.children = res
        }
        return depart
      })
    }

    @action async searchKw(value) {
      const data = {
        kw: value,
        pageNum: 0,
        pageSize: 20,
        departId: this.currentOrg.departId
      }
      const res = await axios.get(API.getDirectoryListByKw, { params: data })
      return res
    }

    @action setDepartList(data) {
      this.departList = data
    }

    @action setCurrentOrg(data) {
      this.currentOrg = data
    }

    @action async searchItem(value) {
      const data = {
        kw: this.kw,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        departId: this.currentOrg.departId
      }
      const res = await axios.get(API.getDirectoryListByKw, { params: data })
      this.searchItemList = res
      return res
    }

    @action setKw (value) {
      this.kw = value
    }

    @action changePage (pageNum, pageSize) {
      this.pageNum = pageNum
      this.pageSize = pageSize
      this.searchItem()
    }

    @action async forcedImport (data) {
      const res = await axios.post(API.forcedImport, data)
      return res
    }
}
export default dictoryStore