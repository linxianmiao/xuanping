import { observable, action, runInAction } from 'mobx'
import { setProps } from '../config/utils'

class TriggerStore {
  @observable.ref trigger = {}

  @observable.ref fieldParams = {
    builtinParams: [], // 内置字段
    defineParams: [], // 自定义字段
    fullParams: [],
    ticketParams: [],
    titleParams: [] // 系统属性
  }

  @observable actionList = []

  @observable loading = false

  @action setProps = setProps(this)

  @action.bound async getTriggerById(id) {
    try {
      this.loading = true
      const res = await axios.get(API.getTriggerById(id)) || {}
      runInAction(() => {
        this.trigger = res
      })
      return res
    } catch (error) {
      console.log(error)
    } finally {
      this.loading = false
    }
  }

  // 1: 事件触发 2: 时间触发
  @action.bound async getActionListByType(type) {
    const res = await axios.get(API.getActionListByType(type))
    runInAction(() => {
      this.actionList = (res || []).filter(item => item.showable)
    })
  }

  @action.bound async getFieldParamList() {
    const res = await axios.get(API.get_field_params)
    runInAction(() => {
      this.fieldParams = res
    })
  }
}

export default new TriggerStore()
