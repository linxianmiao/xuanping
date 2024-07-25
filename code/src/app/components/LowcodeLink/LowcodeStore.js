import { observable, action } from 'mobx'

export default class LowcodeStore {
  @observable pageKey = 'home'

  @observable homeKey = 'model_list'

  @observable appDataKey = 'form_list'

  @observable modelId = ''

  @observable triggerId = ''

  @observable fieldCode = ''

  @observable canModelOperate = ''

  @action
  setProp(key, value) {
    this[key] = value

    if (this.pageKey === 'home') {
      this.init()
    }
  }

  @action
  setProps(props) {
    Object.keys(props).forEach(key => {
      this[key] = props[key]
    })

    if (this.pageKey === 'home') {
      this.init()
    }
  }

  @action
  init() {
    this.modelId = ''
    this.triggerId = ''
    this.fieldCode = ''
    this.canModelOperate = ''
  }

  @action
  clear() {
    this.pageKey = 'home'
    this.homeKey = 'model_list'
    this.appDataKey = 'form_list'
    this.init()
  }
}
