import { observable, action, runInAction } from 'mobx'
import { Base64 } from 'js-base64'

class VerificationStore {
  @observable.ref savaLoading = false

  @observable.ref queryLoading = false

  @observable.ref queryList = []

  @action async saveGlobalRegularization(data) {
    const res = await axios.post(API.saveGlobalRegularization, data)
    return res
  }

  @action async queryGlobalRegularization(params) {
    const res = (await axios.get(API.queryGlobalRegularization, { params: { ...params } })) || {}
    runInAction(() => {
      let data = _.cloneDeep(res?.fieldGlobalRegularizations || [])
      data = _.map(data, (item) => {
        item.field_regularization = Base64.decode(item.field_regularization)
        return item
      })
      this.queryList = data
    })
    return res
  }

  @action async deleteGlobalRegularization(data) {
    const res = await axios.post(API.deleteGlobalRegularization, data)
    return res
  }
}
export default VerificationStore
