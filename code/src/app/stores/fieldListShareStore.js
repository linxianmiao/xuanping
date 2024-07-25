import { observable, action } from 'mobx'
import { FieldListCommonStore } from './fieldListStore'

class FieldListExtendStore extends FieldListCommonStore {
  @observable.ref query = this.getInitialQuery('3')

  @action
  resetQuery() {
    this.query = this.getInitialQuery('3')
  }
}

export default new FieldListExtendStore()