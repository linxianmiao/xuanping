/**
 * 公共的表格store
 */
import { observable, action, runInAction } from 'mobx'

export default class TableStore {
  // 获取服务端数据的方法
  queryFunc = () => new Promise()

  dataKey = 'list' // 返回值中的数据字段key
  totalKey = 'total' // 返回值中的总数字段key
  currentKey = 'pageNum' // 返回值中的页码字段key
  pageSizeKey = 'pageSize' // 返回值中的页大小字段key

  initialPageSize = 10 // 初始页大小

  @observable data = []
  @observable total = 0
  @observable current = 1
  @observable pageSize = this.initialPageSize
  @observable filters = {}
  @observable loading = false
  @observable kw = ''

  // 查询数据
  @action
  query = async (changedParams = {}) => {
    const nextParams = {
      [this.currentKey]: this.current,
      [this.pageSizeKey]: this.pageSize,
      ...this.filters,
      ...changedParams
    }

    this.loading = true

    const res = (await this.queryFunc(nextParams)) || {}

    runInAction(() => {
      this.data = res[this.dataKey] || []
      this.total = res[this.totalKey] || 0
      this.current = res[this.currentKey] || this.current
      this.pageSize = res[this.pageSizeKey] || this.pageSize
      this.loading = false
    })
  }

  // 页码改变
  @action
  onPageChange = (page) => {
    this.current = page
    this.query({ [this.currentKey]: page, kw: this.kw })
  }

  // 页大小改变
  @action
  onShowSizeChange = (page, size) => {
    this.current = 1
    this.pageSize = size
    // 以下代码注释掉，要不然回调2遍接口
    // const changedParams = {
    //   [this.currentKey]: 1,
    //   [this.pageSizeKey]: size
    // }
    // this.query(changedParams)
  }

  // 搜索关键字
  onSearch = (kw) => {
    this.kw = kw
    this.current = 1
    this.query({ [this.currentKey]: 1, kw })
  }

  // 自定义筛选单个条件改变
  @action
  onFilterFieldChange = (value, key, needQuery) => {
    const nextFilters = { ...this.filters, [key]: value }

    this.filters = nextFilters

    if (needQuery) {
      this.current = 1
      this.query({ ...nextFilters, [this.currentKey]: 1 })
    }
  }

  // 自定义筛选多个条件改变
  @action
  onFilterFieldsChange = (obj, needQuery) => {
    const nextFilters = { ...this.filters, ...obj }

    this.filters = nextFilters

    if (needQuery) {
      this.current = 1
      this.query({ ...nextFilters, [this.currentKey]: 1 })
    }
  }

  // 自定义筛选提交，请求列表数据
  @action
  onFilterSubmit = () => {
    this.current = 1
    this.query({ [this.currentKey]: 1 })
  }

  @action
  reset() {
    this.data = []
    this.total = 0
    this.current = 1
    this.pageSize = this.initialPageSize
    this.filters = {}
    this.loading = false
  }
}
