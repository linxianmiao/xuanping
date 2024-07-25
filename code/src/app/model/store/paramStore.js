import { observable, action } from 'mobx'

class Param {
  @observable.ref paramList = []

  @observable.ref count = 0

  @observable paramListLoading = true

  @observable current = 1

  @action changeCurrent = value => {
    this.current = value
  }

  @action saveParam = data => {
    return new Promise(resolve => {
      axios.post(API.saveParam, data).then(res => {
        resolve(res)
      })
    })
  }

  @action queryParamList = data => {
    axios.get(API.queryParamList, { params: data }).then(res => {
      this.paramListLoading = false
      this.paramList = res.list
      this.count = res.counts || 0
    })
  }

  @action deleteParam = data => {
    return new Promise(resolve => {
      axios.get(API.deleteParam, { params: data }).then(res => {
        resolve(res)
      })
    })
  }

  @action getParam = id => {
    return new Promise(resolve => {
      axios.get(API.getParam, { params: { id: id } }).then(res => {
        resolve(res)
      })
    })
  }
}
export default Param
