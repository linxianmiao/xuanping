import { action, observable, runInAction } from 'mobx'
import setProps from '~/utils/setProps'

class TicketChangeStore {
  @observable.ref attrList = []
  @observable.ref fieldList = []

  @action setProps = setProps(this)

  @action async getTicketFormDetail(params) {
    const res = await axios.get(API.getTicketFormDetail, { params })
    runInAction(() => {
      this.attrList = res
    })
    return res
  }

  @action async getFormFieldParams(data) {
    const res = await axios.post(API.getFormFieldParams, data)
    runInAction(() => {
      this.fieldList = res.fieldList
    })
    return res
  }

  @action async updateTicketForm(data) {
    const res = await axios.post(API.updateTicketForm, data)
    return res
  }

  @action reset() {
    this.attrList = []
    this.fieldList = []
  }
}

export default new TicketChangeStore()