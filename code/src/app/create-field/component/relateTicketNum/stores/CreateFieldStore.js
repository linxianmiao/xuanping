import { observable, action, runInAction } from 'mobx'
import { request } from '../utils'
class CreateFieldStore {
  @observable layoutList = []

  @action.bound
  async getLayouts () {
    const res = await request.get('/itsm/api/v2/config/field/queryLayouts') || []
    this.layoutList = res
  }

  @action.bound
  async onSaveField (data) {
    const url = data.id ? '/itsm/api/v2/config/field/updateField' : '/itsm/api/v2/config/field/saveField'
    const res = await request.post(url, data)
    return res
  }
}

export default CreateFieldStore
