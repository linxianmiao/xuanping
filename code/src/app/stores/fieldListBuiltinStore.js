import { observable, action } from 'mobx'
import { FieldListCommonStore } from './fieldListStore'

class FieldListBuiltinStore extends FieldListCommonStore {
  @observable.ref query = this.getInitialQuery('1')

  @action
  resetQuery() {
    this.query = this.getInitialQuery('1')
  }
}

export default new FieldListBuiltinStore()