import { action } from 'mobx'
export default class ProcessList {
  @action async getModelList (query) {
    // 后端没有归档的模型列表
    const res = await axios.get(API.getUseableModels, { params: _.assign({}, { filterUsable: true }, query) }) || {}
    return res.list
  }
}
