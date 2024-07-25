import { action, runInAction, toJS, observable } from 'mobx'
import { qs } from '@uyun/utils'

class DefinitionStore {
    @observable list = []

    @observable priorityList = [0, 0, 0, 0, 0]

    @observable kw = undefined

    @observable checkedList = ['1', '2', '3', '4', '5']

    @observable loading = false

    @action async changeShared (shared, id) {
      const res = await axios.get(API.slasetShared, { params: { slaId: id, shared } })
      return res
    }

    @action async getSLACount (data) {
      const res = await axios({
        url: API.get_sla_count,
        method: 'get',
        params: data,
        paramsSerializer: params => qs.stringify(params, { indices: false })
      }) || []
      runInAction(() => {
        this.priorityList = res || [0, 0, 0, 0, 0]
      })
    }

    @action async getSlaDefinitionList () {
      this.loading = true
      const data = {
        page_num: 1,
        kw: this.kw,
        priority: toJS(this.checkedList)
      }
      const res = await axios({
        url: API.get_sla_definition_list,
        method: 'get',
        params: data,
        paramsSerializer: params => qs.stringify(params, { indices: false })
      }) || {}
      runInAction(() => {
        this.loading = false
        this.list = res.sla_list || []
      })
    }

    @action async deleteSlaDefinitionItem (id) {
      const res = await axios.get(API.delete_sla_definition_item, { params: { id } })
      return res
    }

    @action resetQuery() {
      this.list = []
      this.kw = undefined
      this.priorityList = [0, 0, 0, 0, 0]
      this.checkedList = ['1', '2', '3', '4', '5']
      this.loading = false
    }
}
export default new DefinitionStore()
