import { observable, action, runInAction } from 'mobx'
import setProps from '~/utils/setProps'

class DataBaseStore {
  @observable.ref dataBaseInfo = {
    pageNum: 1,
    pageSize: 10,
    total: 0,
    list: []
  } // 数据表列表

  @observable.ref fieldsInfo = [] // 字段列表

  @observable.ref listInfo = {
    pageNum: 1,
    pageSize: 10,
    total: 0,
    list: []
  } // 数据项列表

  @observable.ref basicinfo = {}

  @observable.ref detailInfo = {}

  // 查询数据表列表
  @action.bound
  async queryDataSetList(params) {
    const res = await axios.get(API.queryDataSetList, { params })
    runInAction(() => {
      this.dataBaseInfo = res
    })
    return res
  }

  @action.bound
  async getDataSet(params) {
    const res = await axios.get(API.getDataSet, { params })
    runInAction(() => {
      this.basicinfo = res
    })
    return res
  }

  // 新建数据表
  @action.bound
  async createDataSet(data) {
    const res = await axios.post(API.createDataSet, data)
    return res
  }

  // 更新数据表
  @action.bound
  async updateDataSet(data) {
    const res = await axios.post(API.updateDataSet, data)
    return res
  }

  // 删除数据表
  @action.bound
  async deleteDataSet(id) {
    const res = await axios.post(API.deleteDataSet(id))
    return res
  }

  // 切换关键属性
  @action.bound
  async switchKeyAttribute(params) {
    const res = await axios.get(API.switchKeyAttribute, { params })
    return res
  }

  //获取表的字段配置
  @action.bound
  async listDataFieldWithPage(params) {
    const res = await axios.get(API.listDataFieldWithPage, { params })
    runInAction(() => {
      this.fieldsInfo = res
    })
    return res
  }

  //获取表的字段配置
  @action.bound
  async listDataFieldWithPages(params) {
    const res = await axios.get(API.listDataFieldWithPage, { params })
    return res
  }

  // 数据库表新增
  @action.bound
  async saveDataSetItem(data) {
    const res = await axios.post(API.saveDataSetItem, data)
    return res
  }

  // 数据库表更新
  @action.bound
  async updateDataSetItem(data) {
    const res = await axios.post(API.updateDataSetItem, data)
    return res
  }

  // 数据库表查询
  @action.bound
  async queryDataSetItem(data, appkey = '') {
    const res = await axios.post(API.queryDataSetItem, data)
    runInAction(() => {
      this.listInfo = res || {}
    })
    return res
  }

  // 数据详情
  @action.bound
  async getDataSetItem(params) {
    const res = await axios.get(API.getDataSetItem, { params })
    runInAction(() => {
      this.detailInfo = res
    })
    return res
  }

  // 删除
  @action.bound
  async deleteDataSetItem(id) {
    const res = await axios.post(API.deleteDataSetItem(id))
    return res
  }

  @action.bound
  setProps = setProps(this)

  @action async getImportProgress(id) {
    const res = await axios.get(API.DATA_PROGRESS(id))
    return res
  }

  //引入字段接口
  @action.bound
  async querySpecifyTypeFields(params) {
    const res = await axios.get(API.querySpecifyTypeFields, { params })
    return res
  }

  //保存引用字段
  @action.bound
  async saveQuoteField(data) {
    const res = await axios.post(API.saveQuoteField, data)
    return res
  }

  //更新引用字段
  @action.bound
  async updateQuoteField(data) {
    const res = await axios.post(API.updateQuoteField, data)
    return res
  }

  //引入字段详情
  @action.bound
  async findQuoteFieldByCode(params) {
    const res = await axios.get(API.findQuoteFieldByCode, { params })
    return res
  }

  //排序
  @action.bound
  async updateQuoteFieldSort(data) {
    const res = await axios.post(API.updateQuoteFieldSort, data)
    return res
  }

  // 根据code查询数据表
  @action.bound
  async getDataSetByCode(params) {
    const res = await axios.get(API.getDataSetByCode, { params })
    return res
  }

  @action.bound
  async queryDataRow(data, appkey = '') {
    let url = API.queryDataRow
    if (appkey) {
      url += `?appkey=${appkey}`
    }
    const res = await axios.post(url, data)
    return res
  }
}
export default new DataBaseStore()
