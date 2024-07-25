import { observable, action } from 'mobx'
import { FieldListCommonStore } from '~/stores/fieldListStore'

export default class ModelFieldListStore extends FieldListCommonStore {
  @observable.ref query = this.getInitialQuery('4')

  @action
  resetQuery = () => {
    this.query = this.getInitialQuery('4')
    this.selectedFieldGroup = undefined
  }
}
