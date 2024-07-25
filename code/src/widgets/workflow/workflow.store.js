import { inject } from '@uyun/core'
import { observable, action } from 'mobx'

export class WorkflowStore {
  // api 是在 ./workflow/widget.js 中 `providers` 配置的
  @inject('api') api

  @observable
  widgetConfig = {}

  @observable
  title = 'itsm/workflow'

  @observable
  info = {}

  @action.bound
  getInfo (newTitle) {
    this.api.test.getInfo()
      .then(data => {
        this.info = data
        this.title = this.info.title
      })
  }

  @action.bound
  setWidgetConfig (newConfig) {
    this.widgetConfig = newConfig
  }
}
