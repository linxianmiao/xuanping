import { action } from 'mobx'
import { request } from '../utils'
class CreateFieldStore {
  @action.bound
  async onSaveField (data) {
    const url = data.id ? '/config/field/updateField' : '/config/field/saveField'
    const res = await request.post(url, data)
    return res
  }
}

export default CreateFieldStore
