import { observable, action, runInAction } from 'mobx'

class RemoteSettingsStore {
  @observable.ref savaLoading = false

  @observable.ref queryLoading = false

  @observable.ref queryList = []

  @action async remoteDockingSave(data) {
    const res = await axios.post(API.remoteDockingSave, data)
    return res
  }

  @action async remoteDockingList(params) {
    this.queryLoading = true
    const res = (await axios.get(API.remoteDockingList, { params: { ...params } })) || {}
    runInAction(() => {
      this.queryList = res.list
      this.queryLoading = false
    })
    return res
  }

  @action async remoteDockingDelete(params) {
    const res = (await axios.get(API.remoteDockingDelete, { params: { ...params } })) || {}
    return res
  }

  @action async remoteDockingUpdate(data) {
    const res = await axios.post(API.remoteDockingUpdate, data)
    return res
  }
}
export default RemoteSettingsStore
