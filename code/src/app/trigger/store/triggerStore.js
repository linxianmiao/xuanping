import { observable, action, runInAction } from 'mobx'

class IndexStore {
  @observable titleParams = []

  // 系统属性
  @observable fullParams = []

  // restFul中的系统属性
  @observable builtinParams = []

  // 内置字段
  @observable defineParams = []

  // 自定义字段
  @observable ticketParams = [] // 所有的工单类型的字段

  @action getFieldParams () {
    axios.get(API.get_field_params).then(res => {
      runInAction(() => {
        this.titleParams = res.titleParams // 系统属性
        this.fullParams = res.fullParams // restFul中的系统属性
        //this.builtinParams = res.builtinParams || [] // 内置字段
        //this.defineParams = res.defineParams || [] // 自定义字段
        // this.ticketParams = res.ticketParams || [] // 所有的工单类型的字段
      })
    })
  }

  @action distory () {
    this.titleParams = [] // 系统属性
    this.fullParams = [] // restFul中的系统属性
    this.builtinParams = [] // 内置字段
    this.defineParams = [] // 自定义字段
    this.ticketParams = [] // 所有的工单类型的字段
  }
}

export default IndexStore
