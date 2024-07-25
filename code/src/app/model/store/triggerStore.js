import { observable, action, runInAction } from 'mobx'

class IndexStore {
  @observable.ref params = []

  @action async getFieldParams (modelId) {
    const res = await axios.get(API.get_field_params, { params: { modelId } }) || {}
    runInAction(() => {
      const { fullParams, builtinParams, defineParams, variableParams } = res
      this.params = [{
        value: 'fullParams',
        name: i18n('system_attr', '系统属性'),
        list: fullParams || []
      }, {
        value: 'builtinParams',
        name: i18n('trigger.sendEmail.builtinParams', '内置字段'),
        list: builtinParams || []
      }, {
        value: i18n('trigger.sendEmail.defineParams', '自定义字段'),
        name: '自定义字段',
        list: defineParams || []
      }, {
        value: 'variableParams',
        name: i18n('ticket-user-variable', '变量'),
        list: variableParams || []
      }]
    })
  }
}

export default IndexStore
