import { observable, action, runInAction } from 'mobx'
import setProps from '~/utils/setProps'
import { qs } from '@uyun/utils'

// 扩展列表和内置列表之上的列表store
class FieldListStore {
  @observable activeKey = '2'

  @action setProps = setProps(this)
}

// 扩展列表和内置列表共同继承的store
class FieldListCommonStore {
  @observable.ref query = {
    layoutId: undefined,
    wd: undefined,
    type: undefined,
    // scope: '1',
    pageNo: 1,
    pageSize: 20
  }

  // 字段分组列表
  @observable.ref layouts = []

  // 选中的字段分组
  @observable.ref selectedFieldGroup = undefined

  // 来源列表
  @observable.ref sourceList = []

  @observable.ref tableObj = {
    list: [],
    total: 0
  }

  @observable loading = false

  getInitialQuery(scope) {
    return {
      scope,
      layoutId: undefined,
      wd: undefined,
      type: undefined,
      pageNo: 1,
      pageSize: 20
    }
  }

  @action setProps = setProps(this)

  @action async changeShared(shared, id) {
    const res = await axios.post(API.batch_shared(shared), { ids: id })
    return res
  }

  @action async onCreateLayout(data) {
    const res = await axios.post(API.save_field_layouts, data)
    return res
  }

  @action async onUpdateLayout(data) {
    const res = await axios.post(API.update_field_layouts, data)
    return res
  }

  @action async onDeleteGroup(id) {
    const res = await axios.post(`${API.delete_field_layouts}/${id}`)
    return res
  }

  @action async isDeleteField(id) {
    const res = await axios.get(API.candel_field, { params: { id } })
    return res
  }

  @action async onDeleteField(id, dataSetId = '') {
    const params = { fieldId: id }
    if (!_.isEmpty(dataSetId)) params.dataSetId = dataSetId
    const res = await axios.post(API.delete_field, qs.stringify(params))
    return res
  }

  @action async onMove(data) {
    const res = await axios.post(API.move_field_layouts, data)
    return res
  }

  // 获取分组列表
  @action async getLayouts() {
    const res = await axios.get(API.query_field_layouts)
    runInAction(() => {
      this.layouts = res || []
    })
  }

  // 获取字段列表
  @action async getFieldList() {
    this.loading = true
    const res = (await axios.get(API.list_field_With_page, { params: this.query })) || {}
    runInAction(() => {
      this.loading = false
      this.tableObj = res
    })
  }

  // 获取跨域字段来源列表
  @action async getSourceList() {
    const res = (await axios.get(API.listParentBusinessUnit)) || []
    runInAction(() => {
      this.sourceList = _.map(res, (item) => ({
        id: item.tenantId,
        pId: item.pid,
        value: item.tenantId,
        title: item.tenantName
      }))
    })
  }

  @action distory() {
    this.wd = undefined
    this.layoutId = undefined
    this.active = '2'
    this.list = []
    this.layouts = []
    this.type = undefined
    this.pageNo = 1
    this.pageSize = 20
    this.selectedFieldGroup = undefined
  }
}

const fieldListStore = new FieldListStore()

export { fieldListStore as default, FieldListCommonStore }
