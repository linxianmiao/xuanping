import { observable, action } from 'mobx'
import dataType from '~/create-field/config/dataType'
import setProps from '~/utils/setProps'

class LoadFieldWidget {
  @observable.ref customFieldList = [] // 自定义字段列表

  @observable.ref widgets = {} // 自定义字段的js代码

  @observable.ref widgetsEvent = [] // 部件的事件合集

  @observable.ref registeredWidgetsEventCode = [] // 已经注册过的字段code

  @action.bound
  async getCustomFieldInfos() {
    const res = (await axios.get(API.getCustomFieldInfos)) || []
    dataType.add(res)
    this.customFieldList = res
  }

  @action.bound
  async submitWidgetsEvent(data, fieldCodes) {
    const { widgetsEvent } = this
    const submitEvent = _.map(
      _.filter(widgetsEvent, (item) => _.includes(fieldCodes, item.code)),
      (item) => (_.isFunction(item.onSubmit) ? item.onSubmit(data) : undefined)
    )
    await Promise.all(submitEvent)
  }

  @action.bound
  async cancelWidgetsEvent(fieldCodes) {
    const { widgetsEvent } = this
    const cancelEvent = _.map(
      _.filter(widgetsEvent, (item) => _.includes(fieldCodes, item.code)),
      (item) => (_.isFunction(item.onCancel) ? item.onCancel() : undefined)
    )
    await Promise.all(cancelEvent)
  }

  @action.bound
  setProps = setProps(this)
}

export default new LoadFieldWidget()
