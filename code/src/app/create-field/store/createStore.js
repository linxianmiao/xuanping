import { observable, action, runInAction } from 'mobx'
import DataType from '../config/dataType'

class CreateStore {
  @observable type = ''

  @observable fieldData = {}

  @observable layouts = []

  @observable resTypeList = []

  @observable specifyField = []

  @observable expandField = []

  @action changeType(type) {
    const id = this.fieldData.id
    if (!id) {
      this.type = type
      this.fieldData = DataType[type] ? DataType[type].fieldData : {}
    }
  }

  @action TreeOrcascader(type) {
    this.type = type
  }

  // 用于无法使用Form组件控制的值的维护
  @action setFieldData(data) {
    this.fieldData = data
  }

  @action async saveFieldData(data) {
    const url = data.id ? API.update_field : API.save_field // 存在id说明是更新字段，否则是保存字段
    const res = (await axios.post(url, data)) || {}
    if (!_.isEmpty(res)) {
      runInAction(() => {
        this.type = ''
        this.fieldData = {}
      })
    }
    return res
  }

  @action getFieldData(type, modelId = '', useScene = '', dataSetId = '') {
    let url = `${API.get_field}?code=${type}&modelId=${modelId}`
    if (useScene) url += `&useScene=${useScene}&dataSetId=${dataSetId}`
    return axios.get(url).then((res) => {
      runInAction(() => {
        const fieldData = DataType[res.type] ? DataType[res.type].fieldData : {}
        this.type = res.type
        this.fieldData = _.merge({}, fieldData, res)
      })
      return res
    })
  }

  @action async queryAllResType(data) {
    const res = await axios.get(API.queryAllResType, { params: data })
    runInAction(() => {
      this.resTypeList = res
    })
  }

  @action async querySpecifyFields(data) {
    const res = await axios.get(API.querySpecifyFields, { params: data })
    runInAction(() => {
      this.specifyField = res
    })
  }

  // 扩展列接口
  @action async queryCiAttributeColumn(data) {
    const res = await axios.get(API.queryCiAttributeColumn, { params: data })
    runInAction(() => {
      this.expandField = res === '200' ? [] : res
    })
  }

  @action distory() {
    this.type = ''
    this.fieldData = {}
    this.layouts = []
  }
}

export default CreateStore
