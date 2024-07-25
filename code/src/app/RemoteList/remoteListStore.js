import { observable, action } from 'mobx'
import TableStore from '../stores/TableStore'
import setProps from '~/utils/setProps'

class RemoteListStore extends TableStore {
  queryFunc = (params) => axios.get(API.queryRemoteList, { params })

  currentKey = 'pageNo'

  initialPageSize = 20

  @observable filters = {
    status: 0
  }

  // 选中的租户，仅做展示用
  @observable selectedTenant = undefined

  @action
  setProps = setProps(this)

  @action
  reset() {
    super.reset()
    this.filters.status = 0
    this.selectedTenant = undefined
  }
}

export default new RemoteListStore()
