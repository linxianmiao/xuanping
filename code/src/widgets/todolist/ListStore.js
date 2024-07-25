import { observable, action, runInAction, toJS, reaction, computed } from 'mobx'
import moment from 'moment'
import jstz from 'jstz'
import axios from './api/request/common'
import * as API from './api/api'
import { detailTime, setProps, flatTicketList, addUrlParams } from './logic'
import {
  exclusiveFilters,
  queryScope,
  defaultColumnList,
  originalQuery,
  defaultCheckedColumnCodes,
  defaultFilterCodes,
  BUILTIN_FIELD_TYPE,
  defaultFilterList
} from './listConfig'
import { getPriorityList } from '../../app/components/ColorPicker/logic'

export default class ListStore {
  @observable.ref ticketList = [] // 工单列表
  @observable.ref modelList = [] // 模型列表
  @observable count = 0 // 工单总数
  @observable filterType = 'myToDo' // 当前工单列表
  @observable.ref typeList = ['myToDo']
  viewTypeParam = 1 // 0-所有工单；1-待办列表  用来作为视图相关接口的参数
  @observable loading = false
  @observable current = 1
  @observable pageSize = 20

  @observable.ref viewList = [] // 视图列表
  @observable.ref viewData = {} // 视图详情

  @observable.ref query = originalQuery // 查询条件

  @observable.ref columnList = defaultColumnList // 列，用于控制列定制显示的属性
  @observable.ref checkedColumnCodes = defaultCheckedColumnCodes // 选中列的code

  @observable.ref checkFilterList = defaultFilterCodes

  @observable.ref ticketAttributeList = {} // 定制列的工单列表信息

  @observable filterVisible = false // 控制 TicketFilter 组件是否显示

  // 优先级列表
  @observable.ref ticketUrgentLevelList = []

  // 环节列表，级联数据格式
  @observable.ref modelAndTacheIdList = []

  // 获取所有字段
  @observable.ref allField = {
    builtinFields: [],
    extendedFields: []
  }

  // 查询条件-选中的属性和字段
  @observable.ref querySelectedList = defaultFilterList
  // 定制列-选中的属性和字段
  @observable.ref columnSelectedList = defaultColumnList.filter(
    (item) => defaultCheckedColumnCodes.indexOf(item.code) > -1
  )

  @observable cusColLoading = false

  @action setProps = setProps(this)

  @action reset() {
    this.ticketList = []
    this.modelList = []
    this.count = 0
    this.filterType = 'myToDo'
    this.loading = false
    this.current = 1
    this.pageSize = 20
    this.viewList = []
    this.viewData = {}
    this.query = originalQuery
    this.columnList = defaultColumnList
    this.checkedColumnCodes = defaultCheckedColumnCodes
    this.ticketUrgentLevelList = []
    this.ticketAttributeList = {}
    this.allField = { builtinFields: [], extendedFields: [] }
    this.cusColLoading = false
    this.stopFormDataReaction()
    this.checkFilterList = defaultFilterCodes
    this.modelAndTacheIdList = []
    this.querySelectedList = defaultFilterList
    this.columnSelectedList = defaultColumnList.filter(
      (item) => defaultCheckedColumnCodes.indexOf(item.code) > -1
    )
  }

  // 设置已选中的值
  @action setSelectedList(list, type) {
    if (type === 'QUERY') {
      this.querySelectedList = list
    } else if (type === 'COLUMN') {
      runInAction(() => {
        this.columnSelectedList = list
      })
    }
  }

  @action async queryFieldInfo() {
    const codes = _.concat(toJS(this.checkFilterList), toJS(this.checkedColumnCodes))
    const res = await axios.get(API.queryFieldDetailsByCodes, {
      params: { codes: _.uniq(codes).join() }
    })
    const listQueryAll = _.cloneDeep(_.concat([], defaultFilterList, res))
    const queryList = this.checkFilterList.map((item) => {
      const field = listQueryAll.find((q) => q.code === item)
      if (field) {
        return { ...field }
      } else {
        return { code: item }
      }
    })
    const listColumnAll = _.cloneDeep(
      _.concat(
        [],
        defaultColumnList.filter((item) => defaultCheckedColumnCodes.indexOf(item.code) > -1),
        res
      )
    )
    const columnList = this.checkedColumnCodes.map((item) => {
      const field = listColumnAll.find((q) => q.code === item)
      if (field) {
        return { ...field }
      } else {
        return { code: item }
      }
    })
    runInAction(() => {
      this.columnSelectedList = columnList.filter((item) => item.name)
      this.querySelectedList = queryList.filter((item) => item.type)
    })
  }

  // 获取所有字段
  @action async getAllColumns() {
    // if (this.allField.builtinFields.length > 0) return
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

  @action async getModelAndTacheIdList() {
    const res = (await axios.get(API.getModelAndTache)) || {}
    runInAction(() => {
      this.modelAndTacheIdList = res || []
    })
  }

  // 获取优先级列表
  @action async getTicketPriority() {
    const res = await axios.get(API.queryFieldUrgentLevel)
    runInAction(() => {
      this.ticketUrgentLevelList = getPriorityList(res)
    })
  }

  @action async getTicketFormData(caseIds, codes) {
    const res = await axios.get(API.getTicketFormData, {
      params: { caseIds: caseIds.toString(), codes: codes.toString() }
    })
    runInAction(() => {
      this.ticketAttributeList = res
    })
  }

  @computed get ticketcolumns() {
    const caseIds = _.map(this.ticketList, (ticket) => ticket.caseId)
    const codes = _.filter(
      this.checkedColumnCodes,
      (item) => !_.includes(defaultCheckedColumnCodes, item)
    )
    return { codes, caseIds }
  }

  formDataReaction = null
  startFormDataReaction = () => {
    if (this.formDataReaction) return
    this.formDataReaction = reaction(
      () => this.ticketcolumns,
      ({ codes, caseIds }) => {
        if (!_.isEmpty(codes)) {
          this.getTicketFormData(caseIds, codes)
        }
      }
    )
  }

  stopFormDataReaction = () => {
    if (typeof this.formDataReaction === 'function') {
      this.formDataReaction()
      this.formDataReaction = null
    }
  }

  @action setQuery(data) {
    _.forEach(data, (val, key) => {
      if (val instanceof Array && moment.isMoment(val[0])) {
        data[key] = [moment(val[0]).format('YYYY-MM-DD'), moment(val[1]).format('YYYY-MM-DD')]
      }
    })
    this.query = data
    return data
  }

  @action setCurrentAndPageSize(current, pageSize) {
    this.current = current
    this.pageSize = pageSize
  }

  // 获取工单详情
  @action getList = () => {
    this.getTicketList()
  }

  // 根据字段code获取字段信息
  @action async queryFieldInfosByCodes(codes) {
    const res = await axios.get(API.queryFieldInfosByCodes, { params: codes })
    return res
  }

  // 获取代办工单列表
  @action async getTicketList() {
    let query = toJS(this.query)
    const codes = _.omit(query, exclusiveFilters)
    if (_.isEmpty(this.allField.builtinFields) && !_.isEmpty(codes)) {
      const res = await this.queryFieldInfosByCodes({ codes: _.keys(codes).join(',') })
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
    const data = {
      pageNum: this.current,
      pageSize: this.pageSize,
      timeZone: jstz.determine().name(),
      filterType: 'todo'
    }
    const filter = _.pick(query, queryScope)
    const extraFilter = _.omit(query, exclusiveFilters)
    this.loading = true
    if (this.filterType === 'myToDo') {
      filter.status = ['1', '2', '10']
      filter.executor = ['currentUser']
    }

    try {
      const res = await axios.post(
        API.person_get_all_ticket,
        _.assign({}, data, filter, { extParams: extraFilter })
      )
      const count =
        (await axios.post(
          API.tickList_count,
          _.assign({}, data, filter, { extParams: extraFilter })
        )) || 0

      runInAction(() => {
        this.ticketList = flatTicketList(res?.list || [])
        this.count = _.isNumber(count) ? count : 0
        this.loading = false
      })
    } catch (error) {
      this.loading = false
      throw error
    }
  }

  // 获取模型列表
  @action async getModelList(query) {
    const res = (await axios.get(API.getUseableModels, { params: query })) || {}
    return res.list || []
  }

  // 获取视图详情
  @action async getQueryView(id) {
    if (id) {
      const res = await axios.get(API.getPersonalQueryView, {
        params: { id, query_list: this.viewTypeParam }
      })
      const query = _.pick(res, queryScope)
      _.forEach(res.extraParams, (item) => {
        query[item.code] = item.defaultValue
      })
      this.viewData = res
      // this.checkFilterList = _.isEmpty(res.extraParams) ? queryScope : res.extraParams
      this.checkFilterList = _.concat(
        res.extraParams.map((item) => item.code),
        queryScope
      )
      if (res.extParams.columns) {
        const falt = _.some(res.extParams.columns, (item) => item === 'ticketName')
        if (falt) {
          this.checkedColumnCodes = res.extParams.columns
        } else {
          this.checkedColumnCodes = [...defaultCheckedColumnCodes, ...res.extParams.columns]
        }
      } else {
        this.checkedColumnCodes = defaultCheckedColumnCodes
      }
      this.queryFieldInfo()

      this.query = query
      this.current = 1
      this.getList()
    } else {
      // 没有id表示清空查询器
      this.viewData = {}
      this.query = originalQuery
      this.current = 1
      this.viewData = {}
      this.checkedColumnCodes = defaultCheckedColumnCodes
      this.queryFieldInfo()
      this.getList()
    }
  }

  // 获取视图列表
  @action async getViewList() {
    const res = await axios.get(API.getAllViewList, { params: { query_list: this.viewTypeParam } })
    runInAction(() => {
      this.viewList = res
    })
  }

  // 保存视图
  @action async saveView(values, payload) {
    const query = detailTime(values, this.allField)
    const filter = _.pick(query, queryScope)
    const data = {
      ...filter,
      ...payload,
      queryList: this.viewTypeParam,
      extParams: _.assign({}, { columns: this.checkedColumnCodes }, _.omit(query, exclusiveFilters))
    }
    const res = await axios.post(API.saveView, data)
    this.getViewList()
    return res
  }

  // 删除视图
  @action async deleteView(id) {
    const url = addUrlParams(API.deletePersonalQueryView, { id, query_list: this.viewTypeParam })
    const res = await axios.post(url)
    this.getViewList()
    return res
  }

  // 更新名字
  @action async updateViewName(data) {
    const url = addUrlParams(API.updatePersonalViewName, {
      ...data,
      query_list: this.viewTypeParam
    })
    const res = await axios.post(url)
    this.getViewList()
    return res
  }
}
