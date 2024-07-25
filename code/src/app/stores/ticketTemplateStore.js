import { observable, action, runInAction } from 'mobx'
import setProps from '~/utils/setProps'

class TicketTemplateStore {
  @observable.ref temp = {} // 模板列表对象

  @observable.ref currentTemp = {} // 当前选中的模板对象

  // 查看某模型下的模板列表
  @action.bound
  async getModelFormTemplateList(params) {
    const res = await axios.get(API.getModelFormTemplateList, { params })
    runInAction(() => {
      if (res) {
        this.temp = {
          ...this.temp,
          [params.modelId]: res
        }
      }
    })
    return res
  }

  // 查看模板详情
  @action.bound
  async getModelFormTemplate(params) {
    const res = await axios.get(API.getModelFormTemplate, { params })
    return res
  }

  // 删除模板
  @action.bound
  async delModelFormTemplate(params) {
    const res = await axios.get(API.delModelFormTemplate, { params })
    return res
  }

  @action.bound
  setProps = setProps(this)
}
export default new TicketTemplateStore()
