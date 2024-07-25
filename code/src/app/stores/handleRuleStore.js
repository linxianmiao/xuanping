import { action, runInAction, observable } from 'mobx'
import setProps from '~/utils/setProps'
class HandleRuleStore {
  @observable.ref ruleQuery = {
    pageNo: 1,
    pageSize: 20,
    kw: undefined,
    sceneId: 'all', // 场景id，多个id以,号分隔，查询未分类下的规则时，请传0
    type: 'HANDLER_RULE',
    modelId: undefined, // 模型id，多个id以,号分隔
    status: undefined // 启用状态 0：停用，1：启用
  }

  @observable rules = { total: 0, list: [] }

  @observable.ref currentRule = {} // 规则详情

  @observable scenesQuery = { kw: undefined, type: 'HANDLER_RULE' }

  @observable scenesList = [] // 场景list

  // 获取规则场景
  @action.bound async getRuleScenes() {
    const res = await axios.get(API.listRuleScenes, { params: this.scenesQuery })
    runInAction(() => {
      this.scenesList = res
    })
  }

  // 新增/更新规则场景
  @action.bound async saveRuleScene(data) {
    const res = await axios.post(API.saveRuleScene, data)
    return res
  }

  // 删除规则场景
  @action.bound async deleteRuleScene(id) {
    const res = await axios.get(API.deleteRuleScene, { params: { id } })
    return res
  }

  // 获取规则列表
  @action.bound async getRulesWithPage() {
    // 全部规则的时候后端没有对应的value，不传就可以
    const ruleQuery = _.assign({}, _.omit(this.ruleQuery, ['sceneId']),
      { sceneId: this.ruleQuery.sceneId === 'all' ? undefined : this.ruleQuery.sceneId }
    )
    const res = await axios.get(API.listRulesWithPage, { params: ruleQuery }) || { total: 0, list: [] }
    runInAction(() => {
      this.rules = res
    })
  }

  // 启用/停用规则
  @action.bound async changeRuleStatus(data) {
    const res = await axios.get(API.changeRuleStatus, { params: data })
    return res
  }

  // 获取规则详情
  @action.bound async getRule(id) {
    const res = await axios.get(API.getRule, { params: { id } })
    runInAction(() => {
      this.currentRule = res
    })
    return res
  }

  // 删除规则
  @action.bound async deleteRule(id) {
    const res = await axios.get(API.deleteRule, { params: { id } })
    return res
  }

  // 新增/更新规则
  @action.bound async saveRule(data) {
    const res = await axios.post(API.saveRule, data)
    return res
  }

  // 查询引用的模型信息
  @action.bound async listRuleModelInfos(data) {
    const res = await axios.post(API.listRuleModelInfos, data)
    return res
  }

  // 获取高级模型列表
  @action.bound async getModelList(query) {
    const res = await axios.get(API.getUseableModels, { params: query }) || {}
    return res.list
  }

  @action setData = setProps(this)
}
export default new HandleRuleStore()