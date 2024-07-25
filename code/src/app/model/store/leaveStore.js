import { observable, action } from 'mobx'

class LeaveStore {
  @observable basicInfoSave = 0;

  @observable fieldSave = 0;

  @observable flowSave = 0

  @action setBasicInfoSave (num) {
    this.basicInfoSave = num
  }

  @action setFieldSave (num) {
    this.fieldSave = num
  }

  @action setFlowSave (num) {
    this.flowSave = num
  }

  @action distory () {
    this.basicInfoSave = 0
    this.fieldSave = 0
    this.flowSave = 0
  }
}

export default LeaveStore
