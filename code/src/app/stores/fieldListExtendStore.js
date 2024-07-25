import { observable, action } from 'mobx'
import { FieldListCommonStore } from './fieldListStore'

class FieldListExtendStore extends FieldListCommonStore {
  @observable.ref query = this.getInitialQuery('2')

  @action
  resetQuery() {
    this.query = this.getInitialQuery('2')
    this.selectedFieldGroup = undefined
  }
}

export default new FieldListExtendStore()