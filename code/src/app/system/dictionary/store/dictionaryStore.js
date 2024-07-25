import { observable, action, runInAction } from 'mobx'

class dictionaryStore {
  @observable
  dicTypeList = []

  @observable
  selectedKey = undefined

  @observable
  dicCode = undefined

  // 选中的字典
  @observable
  dict = undefined

  // 字典类型下数据
  @observable
  dicData = []

  @observable
  total = 0

  @observable
  items = {
    page_num: 1,
    page_size: 10,
    kw: ''
  }

  @action
  init () {
    runInAction(() => {
      this.dicData = []
      this.total = 0
      this.items = {
        page_num: 1,
        page_size: 10,
        kw: ''
      }
    })
  }

  // 查询字典类型
  @action
  async queryDicTypeLists (kw = '') {
    const res = await axios.get(API.queryDictionaryType(kw))
    if (!_.isEmpty(res)) {
      runInAction(() => {
        this.dicTypeList = res
        this.selectedKey = this.selectedKey || res[0].id
        this.dicCode = this.dicCode || res[0].code
        this.dict = this.dict || res[0]
      })
    }
    return res
  }

  // 添加字典类型
  @action
  async saveDicType(params) {
    const res = await axios.post(API.saveDictionaryType, params)
    res && this.queryDicTypeLists()
    return res
  }

  // 编辑字典类型
  @action
  async updateDicType(params) {
    const res = await axios.post(API.updateDictionaryType, params)
    res && this.queryDicTypeLists()
    return res
  }

  // 删除字典类型
  @action
  async deleteDicType () {
    const res = await axios.get(API.deleteDictionaryType(this.dicCode))
    res && this.queryDicTypeLists()
    return res
  }

  // 选择字典类型
  @action
  onSelectDicType(key, item) {
    runInAction(() => {
      this.selectedKey = key
      this.dicCode = item.code
      this.dict = item
    })
  }

  // 查询字典类型下的数据
  @action
  async queryDictionaryData (params = {}) {
    const items = Object.assign(this.items, params)
    const res = await axios.get(API.queryDictionaryData(this.dicCode), { params: items })
    runInAction(() => {
      this.dicData = res.list
      this.total = res.total
    })
    return res
  }

  // 批量增加字典类型下的数据
  @action
  async batchSaveDictionaryData (params) {
    const res = await axios.post(API.batchSaveDicData, params)
    this.queryDictionaryData()
    this.queryDicTypeLists()
    return res
  }

  // 编辑字典类型下数据
  @action
  async updateDictionaryData (params) {
    const res = await axios.post(API.updateDictionaryData, params)
    this.queryDictionaryData()
    return res
  }

  // 批量移除字典类型下字典数据
  @action
  async deleteDictionaryData (params) {
    const res = await axios.post(API.deleteDictionaryData, params)
    this.queryDictionaryData()
    this.queryDicTypeLists()
    return res
  }
}
// eslint-disable-next-line new-cap
export default new dictionaryStore()