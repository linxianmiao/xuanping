import { observable, action, runInAction, toJS, computed } from 'mobx'
import removeFilter from '../config/removeFilter'
import originalQuery from '../config/originalQuery'
import { defaultFilter } from '../config/filter'
import defaultAttributeList from '../config/defaultAttributeList'
import attribute from '../config/attribute'
import { detailTime, getQueryAndColumns } from '../utils'
import setProps from '~/utils/setProps'
import moment from 'moment'
import { qs } from '@uyun/utils'
import { allDefaultQueryList } from '../config/selectDefaultList'
import { pickField } from '~/components/AttrFieldPanel/constants'
import jstz from 'jstz'
import _ from 'lodash'

function flatTicketList(ticketList) {
  return ticketList.reduce((arr, item) => {
    if (item.children) {
      return [...arr, ...item.children]
    } else {
      return [...arr, item]
    }
  }, [])
}

const getList = (listCodes, listAllCodes) => {
  return listCodes.map((item) => {
    const field = listAllCodes.find((q) => q.code === item.code)
    if (field) {
      if (field.id) {
        // 从服务端拿数据
        return { ..._.pick(field, pickField), ...item }
      } else {
        // 前端给的的数据
        return { ...field, ...item }
      }
    } else {
      return item
    }
  })
}
// 如果值为空字符串或空数组空对象，把这些值设置为undefined
const setExtraFilter = (values) => {
  _.forIn(values, (value, key) => {
    if (_.isString(value) && !value) {
      values[key] = undefined
    }
    if (_.isArray(value) && value.length === 0) {
      values[key] = undefined
    }
    if (_.isPlainObject(value) && _.isEmpty(value)) {
      values[key] = undefined
    }
  })
  return values
}

class TicketListStore {
  // 工单列表
  @observable.ref ticketList = []

  // 模型列表
  @observable.ref modelList = []

  // 环节列表，级联数据格式
  @observable.ref modelAndTacheIdList = []

  // 工单总数
  @observable count = 0

  // 当前工单列表
  @observable filterType = 'myToDo'

  // 是否归档
  @observable queryArchived = 0

  // 除去所有工单的内置的工单列表
  @observable.ref typeList = [
    'myToDo',
    'groupTodo',
    'myFollow',
    'myPartIn',
    'draftsList',
    'mycheck',
    'myapprove',
    'batchMyToDo',
    'batchGroup',
    'entrust',
    'todoGroup'
  ]

  // 不请求all接口的type
  @observable getFilterTicketType = [
    'myFollow',
    'myPartIn',
    'draftsList',
    'mycheck',
    'myapprove',
    'batchMyToDo',
    'batchGroup'
  ]

  // 除去所有工单的内置的工单列表
  @observable.ref allTypeList = ['draftsList']

  @observable loading = false

  @observable current = 1

  @observable pageSize = 20

  // 获取所有字段
  @observable.ref allField = {
    builtinFields: [],
    extendedFields: []
  }

  // 所有工单选中的筛选项
  @observable.ref checkFilterList = []

  // 所有试图列表
  @observable.ref viewList = []

  // 视图详情
  @observable.ref viewData = {}

  // 已勾选的工单
  @observable.ref selectedRowKeys = []

  // 已勾选的工单的全部数据，批量处理中需要用到
  @observable.ref selectedRows = []

  @observable.ref query = originalQuery

  @observable.ref attributeList = defaultAttributeList

  @observable approveCount = 0 // 待审阅工单数量

  @observable.ref ticketAttributeList = {} // 定制列的工单列表信息

  @observable formList = [] // 批量处理页面的按钮组信息

  @observable modelRule = {} // 批量处理： 点击提交时获取到的环节信息

  @observable isBatchHandling = false // 是否正在批量处理，用于表格的spin显示

  @observable cusColLoading = false

  // 查询条件-通用属性（前端定义）
  @observable.ref queryAttrList = []
  // 查询条件-选中的属性和字段
  @observable.ref querySelectedList = []
  // 定制列-通用属性（前端定义）
  @observable.ref columnAttrList = attribute
  // 定制列-选中的属性和字段
  @observable.ref columnSelectedList = []

  @action setProps = setProps(this)

  @action async queryFieldInfo(codes, query, column) {
    const res = await axios.get(API.queryFieldDetailsByCodes, {
      params: { codes: _.uniq(codes).join() }
    })
    const queryListAll = _.cloneDeep(_.concat([], [...toJS(this.queryAttrList)], res))
    const queryList = getList(query, queryListAll)
    const columnListAll = _.cloneDeep(_.concat([], [...toJS(this.columnAttrList)], res))
    const columnList = getList(column, columnListAll)
    runInAction(() => {
      this.columnSelectedList = columnList.filter((item) => item.name)
      this.querySelectedList = queryList.filter((item) => item.type)
    })
  }

  // 设置通用属性
  @action setAttrList(list, type) {
    if (type === 'QUERY') {
      this.queryAttrList = list
    } else if (type === 'COLUMN') {
      this.columnAttrList = list
    }
  }

  // 设置已选中的值
  @action setSelectedList(list, type) {
    if (type === 'QUERY') {
      this.querySelectedList = list
      window.TICKET_QUERY[this.filterType].querySelectedList = list
    } else if (type === 'COLUMN') {
      runInAction(() => {
        this.columnSelectedList = list
      })
    }
  }

  @action setSelectedRowKeys(selectedRowKeys, selectedRows) {
    this.selectedRowKeys = selectedRowKeys
    this.selectedRows = selectedRows
  }

  // 设置选中的筛选项
  @action setCheckFilterList(checkFilterList, filterType) {
    if (!window.TICKET_CHECK_FILTER_LIST) {
      window.TICKET_CHECK_FILTER_LIST = {}
    }
    this.checkFilterList = checkFilterList
    window.TICKET_CHECK_FILTER_LIST[filterType || this.filterType] = checkFilterList
  }

  @action setValue(value, type) {
    this[type] = value
  }

  @action setQuery(data) {
    _.forEach(data, (val, key) => {
      if (val instanceof Array && moment.isMoment(val[0])) {
        data[key] = [
          moment(val[0]).format('YYYY-MM-DD HH:mm:ss'),
          moment(val[1]).format('YYYY-MM-DD HH:mm:ss')
        ]
      }
    })
    this.query = data
    window.TICKET_QUERY[this.filterType] = {
      ...window.TICKET_QUERY[this.filterType],
      query: data
    }
    return data
  }

  @action resetSelected() {
    this.selectedRowKeys = []
    this.selectedRows = []
  }

  @action setFilterType(data, query) {
    this.resetSelected()
    this.filterType = data
    this.viewData = {}
  }

  @action.bound setAttributeList(attributeList = defaultAttributeList) {
    this.attributeList = attributeList
    window.TICKET_QUERY[this.filterType] = {
      ...window.TICKET_QUERY[this.filterType],
      attributeList
    }
  }

  @action setCurrentAndPageSize(current, pageSize) {
    this.current = current || 1
    this.pageSize = pageSize || 20
    window.TICKET_QUERY[this.filterType] = {
      ...window.TICKET_QUERY[this.filterType],
      current: current || 1,
      pageSize: pageSize || 20
    }
    return { current, pageSize }
  }

  // 根据字段code获取字段信息
  @action async queryFieldInfosByCodes(codes) {
    const res = await axios.get(API.queryFieldInfosByCodes, { params: codes })
    return res
  }

  @action async queryApproveCount() {
    const res = await axios.get(API.queryApproveCount)
    runInAction(() => {
      this.approveCount = res
    })
  }

  // 获取工单详情
  @action getList(type) {
    if (!_.includes(this.getFilterTicketType, this.filterType)) {
      this.getAllTicketList()
    } else {
      this.getTicketList()
    }
    const { viewData, filterType } = this
    window.TICKET_QUERY[this.filterType] = {
      ...window.TICKET_QUERY[this.filterType],
      viewData,
      filterType
    }
  }

  @action async getModelAndTacheIdList() {
    const res = (await axios.get(API.getModelAndTache)) || {}
    runInAction(() => {
      this.modelAndTacheIdList = res || []
    })
  }

  // 获取工单列表总数
  @action async getTicketListCount(data) {
    const res = (await axios.post(API.tickList_count, data)) || {}
    runInAction(() => {
      this.count = _.isNumber(res) ? res : 0
    })
  }

  // 获取代办 关注 参与 的工单列表
  @action async getTicketList() {
    this.loading = true
    const query = detailTime(toJS(this.query))

    const filter = _.assign(
      {},
      query,
      {
        pageNum: this.current,
        pageSize: this.pageSize
      },
      { filterType: this.filterType === 'mycheck' ? 'approve' : this.filterType }
    )

    const res =
      (await axios({
        url: API.get_ticketList,
        method: 'get',
        params: filter,
        paramsSerializer: (params) => qs.stringify(params, { indices: false })
      })) || {}
    runInAction(() => {
      this.ticketList = flatTicketList(res.list || [])
      this.count = res.count
      this.loading = false
    })
  }

  // 获取所有工单的列表
  @action async getAllTicketList() {
    let query = _.cloneDeep(this.query)
    const codes = _.omit(this.query, removeFilter)
    if (_.isEmpty(this.allField.builtinFields) && !_.isEmpty(codes)) {
      const res = await this.queryFieldInfosByCodes({ codes: _.keys(codes).toString() })
      query = detailTime(query, res)
    } else {
      query = detailTime(query, this.allField)
    }
    let overdue = _.get(query, 'overdue')
    if (overdue) {
      if (_.isString(overdue)) {
        overdue = [Number(overdue)]
      } else if (_.isArray(overdue)) {
        overdue = _.map(overdue, (item) => Number(item))
      }
      _.set(query, 'overdue', overdue)
    }
    let filterType = 'all'
    if (this.filterType === 'myToDo' || this.filterType === 'groupTodo') {
      filterType = 'todo'
    } else if (this.filterType === 'archived') {
      filterType = 'archived'
    } else if (this.filterType === 'mycreate') {
      filterType = 'myCreate'
    } else if (this.filterType === 'entrust') {
      filterType = 'entrust'
    } else if (this.filterType === 'todoGroup') {
      filterType = 'todo_group'
    }
    const data = {
      pageNum: this.current,
      pageSize: this.pageSize,
      timeZone: jstz.determine().name(),
      filterType
    }

    const filter = _.pick(query, defaultFilter)
    // 解析时间字段
    _.forEach(filter, (val, key) => {
      if (
        (val instanceof Array && moment.isMoment(val[0])) ||
        (val instanceof Array && isNaN(val[0]) && !isNaN(Date.parse(val[0])))
      ) {
        filter[key] = [
          moment(val[0]).format('YYYY-MM-DD HH:mm:ss'),
          moment(val[1]).format('YYYY-MM-DD HH:mm:ss')
        ]
      }
    })
    const extraFilter = _.omit(query, removeFilter)
    this.loading = true

    const res = await axios({
      url: API.person_get_all_ticket,
      method: 'post',
      data: _.assign(
        {},
        data,
        filter,
        { queryArchived: this.queryArchived },
        { extParams: setExtraFilter(extraFilter) }
      )
    })
    this.getTicketListCount(
      _.assign(
        {},
        data,
        filter,
        { queryArchived: this.queryArchived },
        { extParams: setExtraFilter(extraFilter) }
      )
    )
    runInAction(() => {
      this.ticketList = flatTicketList(res.list || [])
      //   this.count = res.count
      this.loading = false
    })
  }

  @action async getModelList(query) {
    const res = (await axios.get(API.getUseableModels, { params: query })) || {}
    return res.list
  }

  @action async getModelsByIds(modelId) {
    const res = (await axios.get(API.getModelsByIds, { params: { modelId } })) || {}
    return res
  }

  // 获取导入工单的进度
  @action async getImportProgress(id) {
    const res = await axios.get(API.EXPORT_PROGRESS(id))
    return res
  }

  // 获取所有字段
  @action async getAllColumns() {
    // this.cusColLoading = true
    // const res = await axios.get(API.getAllColumns) || {}
    // runInAction(() => {
    //   const { builtinFields, extendedFields } = res
    //   this.allField = {
    //     builtinFields: builtinFields,
    //     extendedFields: _.filter(extendedFields, item => _.includes(BUILTIN_FIELD_TYPE, item.type)) || []
    //   }
    //   this.cusColLoading = false
    // })
  }

  // 获取所有的试图列表
  @action async getViewList(data) {
    const res = await axios.get(API.getAllViewName, { params: data })
    runInAction(() => {
      this.viewList = res
    })
  }

  // 删除视图
  @action async deleteView(id) {
    await axios.get(API.deleteQueryView, {
      params: { id, viewCode: this.filterType === 'all' ? 'all_ticket' : this.filterType }
    })
    this.getViewList({ viewCode: this.filterType === 'all' ? 'all_ticket' : this.filterType })
  }

  // 更新视图名称
  @action async updateViewName(data) {
    const res = await axios.get(API.updateViewName, { params: data })
    this.getViewList({ viewCode: this.filterType === 'all' ? 'all_ticket' : this.filterType })
    return res
  }

  @action async saveQueryView(data) {
    const res = await axios.post(API.saveQueryView, data)
    this.getViewList({ viewCode: this.filterType === 'all' ? 'all_ticket' : this.filterType })
    return res
  }

  // 视图详情
  @action async getQueryView(data, ticketMenuList) {
    // 没有id表示清空查询器
    if (!data.id) {
      this.current = 1
      this.viewData = {}
      const { query, columnsListCode, queryListCode, queryList, columnsList, queryArchived } =
        getQueryAndColumns(ticketMenuList, this.filterType)
      this.queryArchived = queryArchived
      this.query = query
      this.queryFieldInfo(_.concat(columnsListCode, queryListCode), queryList, columnsList)
      window.TICKET_QUERY[this.filterType] = {
        ...window.TICKET_QUERY[this.filterType],
        viewData: {},
        query: { ...query },
        current: 1
      }
      this.getAllTicketList()
      return
    }

    const res = await axios.get(API.getQueryView, { params: data })
    runInAction(() => {
      const extParams = _.get(res, 'extParams', {})
      const querySelected = extParams.querySelectedList
      const columnSelected = extParams.columnSelectedList
      const query = {}
      let queryList = []
      let queryListCode = []
      let columnsList = []
      let columnsListCode = []
      if (querySelected && columnSelected) {
        columnsList = columnSelected
        columnsListCode = columnSelected.map((item) => item.code)
        _.forEach(querySelected, (item) => {
          if (!item.value) {
            item.value = res[item.code] || extParams[item.code]
          }
        })
        queryList = querySelected
        queryListCode = querySelected.map((item) => item.code)
      } else {
        columnsListCode = extParams.columns || []
        columnsList = columnsListCode.map((item) => {
          return { code: item }
        })
        const keys = _.concat(_.keys(res), _.keys(extParams))
        const filterKey = ['viewId', 'name', 'extParams', 'pageNum', 'pageSize']
        const allCode = _.uniq(_.filter(keys, (item) => filterKey.indexOf(item) === -1))
        const sameCode = _.intersection(allDefaultQueryList, allCode)
        queryListCode = _.union(sameCode, allCode)
        queryList = queryListCode.map((item) => {
          return { code: item, value: res[item] || extParams[item] }
        })
      }
      _.forEach(queryList, (item) => {
        query[item.modelId ? `${item.modelId}_${item.code}` : item.code] = item.value
      })
      this.queryFieldInfo(_.concat(columnsListCode, queryListCode), queryList, columnsList)
      window.TICKET_QUERY[this.filterType] = {
        ...window.TICKET_QUERY[this.filterType],
        query: { ...query }
      }
      this.viewData = res
      this.query = query
      this.current = 1
      this.getAllTicketList()

      window.TICKET_QUERY[this.filterType] = {
        ...window.TICKET_QUERY[this.filterType],
        viewData: this.viewData,
        attributeList: this.attributeList,
        query,
        current: 1
      }
    })
    return res
  }

  // 批量删除
  @action async ticketListBatchDelete(ticketIdList) {
    const res = await axios.post(API.BATCH_DELETE, { ticketIdList })
    return res
  }

  @action async getTicketFormData(caseIds, codes) {
    if (caseIds.length === 0) return false
    const res = await axios.get(API.getTicketFormData, {
      params: { caseIds: caseIds.toString(), codes: codes.toString() }
    })
    if (!_.isEmpty(res)) {
      runInAction(() => {
        this.ticketAttributeList = res
      })
    }
  }

  @computed get ticketcolumns() {
    const caseIds = _.map(this.ticketList, (ticket) => ticket.caseId)
    const codes = _.map(this.columnSelectedList, (item) => {
      return item.modelId ? `${item.modelId}_${item.code}` : item.code
    })
    return { codes, caseIds }
  }

  // 获取批量处理按钮组
  @action async getHandleButtons(ticketIdList, tacheId) {
    const res = await axios.post(API.getHandleButtons, { ticketIdList, tacheId })
    runInAction(() => {
      if (res) {
        this.formList = res || {}
      }
    })
  }

  // 获取批量处理列表
  @action.bound async getBatchHandleTicketList() {
    this.loading = true
    const query = detailTime(toJS(this.query))

    const { current, pageSize, filterType } = this
    const params = { ...query, pageNum: current, pageSize, filterType }

    let res = await axios.get(API.getBatchHandleTicketList, { params })
    if (!res) res = { list: [], count: 0 }
    runInAction(() => {
      this.ticketList = flatTicketList(res ? res.list : [])
      this.count = res.count
      this.loading = false
    })
  }

  @action initBatchData = () => {
    this.setProps({
      query: originalQuery,
      selectedRowKeys: [],
      selectedRows: [],
      current: 1,
      pageSize: 20,
      count: 0
    })
  }

  // 批量处理：点击提交获取环节信息
  @action async getBatchActivityById(tacheId, ticketIdList) {
    const res = await axios.post(API.getBatchActivityById(tacheId), { ticketIdList })
    runInAction(() => {
      this.modelRule = res || {}
    })
    return res
  }

  @action async batchHandleTicket(payload) {
    const res = await axios.post(API.batchHandleTicket, payload)
    return res
  }

  @action async getBatchHandleProgress(batchHandleId) {
    const res = await axios.get(API.getBatchHandleProgress, { params: { batchHandleId } })
    runInAction(() => {
      if (res === '100') {
        this.isBatchHandling = false
      }
    })
  }
}
export default new TicketListStore()
