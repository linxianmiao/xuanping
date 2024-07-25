import { action, observable } from 'mobx'
import { request } from '../utils'

class CreateFieldStore {
  @observable layoutList = []

  @action.bound
  async getLayouts () {
    this.layoutList = await request.get(
      '/itsm/api/v2/config/field/queryLayouts') || []
  }

  @action.bound
  async onSaveField (data) {
    const url = data.id
      ? '/itsm/api/v2/config/field/updateField'
      : '/itsm/api/v2/config/field/saveField'
    return await request.post(url, data)
  }
}

export default CreateFieldStore
