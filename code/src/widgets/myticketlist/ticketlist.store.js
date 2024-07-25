import { inject } from '@uyun/core'
import request from './api/request'
import { observable, action, runInAction, reaction, computed } from 'mobx'
import moment from 'moment'
import {
  getQuery,
  getQueryer,
  builtInQuery,
  removeFilter,
  defaultAttributeList,
  BUILTIN_FIELD_TYPE,
  ALL_FILTER_LIST,
  defaultColumnList,
  defaultCheckedColumnCodes,
  defaultFilterCodes
} from './config'
import { getPriorityList } from '../../app/components/ColorPicker/logic'
import { setProps } from './logic'
import axios from 'axios'
import _ from 'lodash'

export class TicketlistStore {
  // api 是在 ./ticketlist/widget.js 中 `providers` 配置的
  @inject('api') api

  // 查询条件-选中的属性和字段
  @observable.ref querySelectedList = ALL_FILTER_LIST

  //当前登录人所属部门
  @observable.ref currentDept = []

  @observable.ref menuList = []

  @observable.ref ticketList = []

  @observable count = 0

  @observable loading = false

  @observable.ref attributeList = defaultAttributeList

  @observable.ref query = {
    pageNum: 1,
    filterType: 'mytodo',
    pageSize: 10
  }

  @observable.ref newQuery = {}

  @observable.ref columnList = defaultColumnList // 列，用于控制列定制显示的属性
  @observable.ref checkedColumnCodes = defaultCheckedColumnCodes // 选中列的code
  @observable.ref lockCondition = [] //高级搜索中锁定的字段

  // 定制列-选中的属性和字段
  @observable.ref columnSelectedList = defaultColumnList.filter(
    (item) => defaultCheckedColumnCodes.indexOf(item.code) > -1
  )

  @observable.ref checkFilterList = defaultFilterCodes

  @observable modelInLayoutByUser = []

  @observable.ref ticketAttributeList = {} // 定制列的工单列表信息

  @observable.ref modelAndTacheIdList = []

  // 所有字段
  @observable.ref allField = null

  // 优先级列表
  @observable.ref ticketUrgentLevelList = []

  @observable.ref tabCounts = {}

  @observable.ref treeList = []

  @computed get ticketcolumns() {
    const caseIds = _.map(this.ticketList, (ticket) => ticket.caseId)
    const codes = _.filter(
      this.checkedColumnCodes,
      (item) => !_.includes(defaultCheckedColumnCodes, item)
    )
    return { codes, caseIds }
  }

  search = _.debounce(this.getTicketList, 500)

  disposerTicketList = reaction(
    () => [this.query],
    () => {
      this.search()
    }
  )

  @action setProps = setProps(this)

  // 设置已选中的值
  @action setSelectedList(list, type) {
    if (type === 'INITQUERY') {
      this.querySelectedList = ALL_FILTER_LIST
    }
    if (type === 'QUERY') {
      this.querySelectedList = list
    } else if (type === 'COLUMN') {
      runInAction(() => {
        this.columnSelectedList = list
      })
    }
  }

  // 创建工单模型
  @action.bound
  async getModelInLayoutByUser() {
    const res = await this.api.getModelInLayoutByUser()
    runInAction(() => {
      this.modelInLayoutByUser = res
    })
  }

  // 修改列的顺序 mytodo mypartin  mycreate myfollow
  @action.bound
  async changeColumns() {
    const { filterType } = this.query
    if (['mytodo', 'mypartin'].includes(filterType)) {
      this.attributeList = [
        ...defaultAttributeList,
        'departorName',
        'creatorName',
        'executorAndGroup',
        'creatorTime',
        'updateTime'
      ]
      if (filterType === 'mytodo')
        this.attributeList = _.filter(this.attributeList, (item) => item !== 'executorAndGroup')
    } else if (['mycreate', 'myfollow'].includes(filterType)) {
      this.attributeList = [...defaultAttributeList, 'executorAndGroup', 'creatorTime']
    } else if (['myapprove'].includes(filterType)) {
      this.attributeList = [...defaultAttributeList, 'departorName']
    } else if (['mydrafts'].includes(filterType)) {
      this.attributeList = [...defaultAttributeList, 'creatorTime']
    } else {
      this.attributeList = defaultAttributeList
    }
  }

  // tab总数
  @action.bound
  async getTabCount() {
    const res = await this.api.getTabCount()
    runInAction(() => {
      const tabCounts = {}
      if (!_.isEmpty(res) && Array.isArray(res)) {
        _.forEach(res, (item) => {
          if (item.filterUrl === 'myGroupToDo') {
            tabCounts.todoCount = item?.num || 0
          } else if (item.filterUrl === 'myFollow') {
            tabCounts.myfollowCount = item?.num || 0
          } else if (item.filterUrl === 'myDraft') {
            tabCounts.mydraftCount = item?.num || 0
          }
        })
      }
      this.tabCounts = tabCounts
    })
  }

  // 获取待办，参与，关注的工单列表
  @action.bound
  async getTicketList() {
    this.loading = true
    const expandQuery = _.omit(this.query, removeFilter) // 扩展的查询条件
    let query = {}
    if (_.isEmpty(_.get(this.allField, 'builtinFields')) && !_.isEmpty(expandQuery)) {
      // const res = await this.queryFieldInfosByCodes({ codes: _.keys(expandQuery).toString() })
      query = getQuery(this.query, [])
    } else {
      query = getQuery(this.query, this.allField)
    }

    console.log(query, 'query')

    let res = {}
    let count = 0
    if (['myCreate', 'all'].includes(query.filterType)) {
      const filter = _.pick(query, builtInQuery)
      const extraFilter = _.omit(query, removeFilter)
      let param = {}
      if (query.filterType === 'myCreate') {
        param = {
          creator: ['currentUser']
        }
      }
      // else {
      //   param = {
      //     participantsDepartIds: this.currentDept
      //   }
      // }
      res = await this.api.getALLTicketList(_.assign({ extParams: extraFilter }, filter, param))
      count = await this.api.getALLTicketListCount(
        _.assign({ extParams: extraFilter }, filter, param)
      )
      count = _.isNumber(count) ? count : 0
    } else if (['todo'].includes(query.filterType)) {
      const filter = _.pick(query, builtInQuery)
      const extraFilter = _.omit(query, removeFilter)
      const param = {
        executor: ['currentUser'],
        executionGroup: ['currentGroup'],
        status: ['1', '2', '10']
      }

      res = await this.api.getTodoTicketList(_.assign(param, { extParams: extraFilter }, filter))
      count = await this.api.getTodoTicketListCount(
        _.assign(param, { extParams: extraFilter }, filter)
      )
      count = _.isNumber(count) ? count : 0
    } else if (['myFollow'].includes(query.filterType)) {
      if (_.isEmpty(query?.classifyCode)) {
        res = []
        count = 0
      } else {
        res = await this.api.getFollowTicketList(query)
        res = res?.data?.data || []
        count = res.count || 0
      }
    } else if (['myapprove', 'myPartIn'].includes(query.filterType)) {
      delete query?.classifyCode
      res = await this.api.getTicketListwithAllApps(query)
      count = res?.count || 0
    } else if (['mydrafts'].includes(query.filterType)) {
      const param = {
        page: query.pageNum - 1 || 0,
        rows: query.pageSize || 10
      }
      res = await this.api.getTicketCrafts(param)
      count = res?.total
    } else {
      delete query?.classifyCode
      res = await this.api.getTicketList(query)
      count = res?.count || 0
    }

    runInAction(() => {
      const ticketList = res?.list || []
      let list = ticketList.reduce((a, b) => {
        if (b.children) {
          return [...a, ...b.children]
        } else {
          return [...a, b]
        }
      }, [])
      if (['mydrafts'].includes(query.filterType)) {
        list = res?.data || []
      }
      this.ticketList = list
      this.count = count
      this.loading = false
      if (['all'].includes(query.filterType)) {
        this.getTicketFormData()
      }
    })
  }

  @action.bound
  async queryFieldInfosByCodes(codes) {
    const res = await request.get('/config/field/queryFieldInfosByCodes', { params: codes })
    return res
  }

  // 获取带有查询器的列表
  @action.bound
  async queryPortalMenus() {
    const res = await this.api.queryPortalMenus('ticketlist')
    let { allMenuList, selectCodes } = res || {}
    const types = new Set(['BUILT', 'QUERYER'])

    allMenuList = _.reduce(
      allMenuList,
      (all, item) => {
        if (types.has(item.type)) {
          return [...all, item]
        } else if (item.type === 'GROUP') {
          const children = item?.children || []
          return [...all, ...children]
        }
      },
      []
    )

    selectCodes = selectCodes || _.map(allMenuList, (item) => item.code)
    const menuList = _.filter(allMenuList, (item) => _.includes(selectCodes, item.code))

    const filterType = _.get(menuList, '[0].code')
    const menu = getQueryer(filterType, menuList)
    const queryMenuView = _.get(menu, 'queryMenuView')
    const attributeList = _.get(menu, 'queryMenuView.extParams.columns') || defaultAttributeList
    const queryerData = _.omit(queryMenuView, [
      'extParams',
      'columns',
      'pageNum',
      'pageSize',
      'filterType',
      'orderBy',
      'orderRule',
      'orderField'
    ])
    const extParamsData = _.omit(_.get(queryMenuView, 'extParams'), ['columns'])

    this.selectCodes = selectCodes
    this.allMenuList = allMenuList
    this.menuList = menuList
    this.attributeList = attributeList
    this.query = {
      ...extParamsData,
      ...queryerData,
      pageNum: 1,
      orderBy: _.get(queryMenuView, 'orderField'),
      sortRule: _.get(queryMenuView, 'orderField') === 'status' ? 'ascend' : 'descend',
      filterType,
      pageSize: 20
    }
    return {
      selectCodes: selectCodes
    }
  }

  // 获取模型环节信息
  @action.bound
  async getModelAndTacheIdList() {
    const res = await request.get('/ticket/getModelAndTache')
    runInAction(() => {
      this.modelAndTacheIdList = res || []
    })
  }

  // 获取所有字段
  @action.bound
  async getAllColumns() {
    if (this.allField) return false
    const res = (await request.get('/config/field/getAllColumns')) || {}
    runInAction(() => {
      const { builtinFields, extendedFields } = res
      this.allField = {
        builtinFields: builtinFields,
        extendedFields:
          _.filter(extendedFields, (item) => _.includes(BUILTIN_FIELD_TYPE, item.type)) || []
      }
    })
  }

  // 获取模型列表信息
  @action.bound
  async getModelList(query) {
    const res = (await request.get('/config/model/getUseableModels', { params: query })) || {}
    return res?.list
  }

  @action.bound
  async getModelsByIds(modelId) {
    const res = (await request.get('/config/model/getModelsByIds', { params: { modelId } })) || {}
    return res
  }

  // 获取当前列表的定制列的具体信息
  @action.bound
  async getTicketFormData() {
    const { caseIds, codes } = this.ticketcolumns
    if (_.isEmpty(caseIds) || _.isEmpty(codes)) {
      return false
    }
    const res = await request.get('/ticket/getTicketFormData', {
      params: { caseIds: caseIds.toString(), codes: codes.toString() }
    })
    runInAction(() => {
      this.ticketAttributeList = res
    })
  }

  @action.bound
  setValue(value, type) {
    this[type] = value
  }

  @action setQuery(data, queryArchived) {
    console.log('setQuery', this.query, data, queryArchived)
    _.forEach(data, (val, key) => {
      if (val instanceof Array && moment.isMoment(val[0])) {
        data[key] = [
          moment(val[0]).format('YYYY-MM-DD HH:mm:ss'),
          moment(val[1]).format('YYYY-MM-DD HH:mm:ss')
        ]
      }
    })
    this.query = {
      ...this.query,
      queryArchived,
      ...data
    }
    return data
  }

  // 获取优先级列表
  @action async getTicketPriority() {
    const res = await request.get('/config/field/queryFieldUrgentLevel')
    runInAction(() => {
      this.ticketUrgentLevelList = getPriorityList(res)
    })
  }

  // 是否关注
  @action.bound
  async attentionTicket(ticketId, status, modelId) {
    const res = await this.api.attentionTicket(ticketId, status, modelId)
    return res
  }

  // 关注项
  @action.bound
  async queryTreeList(code, creator, init = false, name = '') {
    const res = await axios.get(
      `/itsmutil/frontapi/v1/classify/query?code=${code}&creator=${creator}&name=${name}`
    )
    runInAction(() => {
      this.treeList = res?.data || []
      if (init) {
        this.query = {
          ...this.query,
          classifyCode: res?.data[0]?.classifyCode
        }
      }
    })
    return res?.data || []
  }

  //移动关注工单至分组
  @action.bound
  async saveFollowTicket(data) {
    const res = await axios.post(`/itsmutil/frontapi/v1/classifyTicket/save`, data)
    return res.data.success || false
  }

  @action.bound
  async queryCodeTreeList(code) {
    const res = await axios.get(`/itsmutil/frontapi/v1/classify/queryByCode?code=${code}`)
    return res?.data || []
  }

  @action.bound
  async saveTreeList(data) {
    const res = await axios.post('/itsmutil/frontapi/v1/classify/save', data)
    return res.data.success || false
  }

  @action.bound
  async deleteTreeList(id) {
    const res = await axios.get(`/itsmutil/frontapi/v1/classify/deleteById?id=${id}`)
    return res.data.success || false
  }

  @action.bound
  async deleteTicketCache(id) {
    const res = await this.api.deleteTicketCache(id)
    return res
  }

  @action.bound
  async getExportProgress(exportId) {
    const res = await this.api.getExportProgress(exportId)
    return res
  }

  @action.bound
  async exportTicketList(data) {
    const res = await this.api.EXPORT(data)
    return res
  }

  @action.bound
  async getUserSupDept() {
    const res = await this.api.getUserSupDept()
    runInAction(() => {
      if (res) {
        this.currentDept = _.map(res, (d) => d?.departId)
      }
    })
  }
}
