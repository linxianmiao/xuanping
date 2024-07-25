import { observable, action, runInAction, toJS } from 'mobx'
import defaultAttributeList from '../config/defaultAttributeList'
import { BUILTIN_FIELD_TYPE } from '~/create-field/config/dataType'
import { pickField } from '~/components/AttrFieldPanel/constants'
import getFieldType from '~/utils/getFieldType'

function getWidthBycode(code, type, widthNum, widthType) {
  let width = { widthType: ['fixed', 'fixedWrap'], widthNum: 0 }
  switch (code) {
    case 'ticketName':
      width = {
        widthType: Array.isArray(widthType) ? widthType : ['fixed', 'fixedWrap'],
        widthNum: widthNum || 240
      }
      break
    case 'ticketNum':
      width = {
        widthType: Array.isArray(widthType) ? widthType : ['fixed', 'fixedWrap'],
        widthNum: widthNum || 180
      }
      break
    case 'priority':
      width = {
        widthType: Array.isArray(widthType) ? widthType : ['fixed', 'fixedWrap'],
        widthNum: widthNum || 120
      }
      break
    case 'status':
      width = {
        widthType: Array.isArray(widthType) ? widthType : ['fixed', 'fixedWrap'],
        widthNum: widthNum || 120
      }
      break
    case 'executorAndGroup':
      width = {
        widthType: Array.isArray(widthType) ? widthType : ['fixed', 'fixedWrap'],
        widthNum: widthNum || 190
      }
      break
    case 'creatorTime':
    case 'updateTime':
      width = {
        widthType: Array.isArray(widthType) ? widthType : ['fixed', 'fixedWrap'],
        widthNum: widthNum || 160
      }
      break
    case 'participants':
      width = {
        widthType: Array.isArray(widthType) ? widthType : ['fixed', 'fixedWrap'],
        widthNum: widthNum || 190
      }
      break
    default:
      if (type === 'dateTime') {
        width = {
          widthType: Array.isArray(widthType) ? widthType : ['fixed', 'fixedWrap'],
          widthNum: widthNum || 160
        }
      } else {
        width = {
          widthType: Array.isArray(widthType) ? widthType : ['fixed', 'fixedWrap'],
          widthNum: widthNum || 190
        }
      }
      break
  }
  return width
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
class ListStore {
  @observable.ref groupList = []

  // 分组列表
  @observable.ref modelList = []

  // 模型列表
  @observable.ref modelAndTacheIdList = []

  // 当前工单列表
  @observable loading = false

  @observable.ref allField = {
    builtinFields: [],
    extendedFields: []
  }

  // 获取所有字段
  @observable checkFilterList = []

  @observable attributeList = defaultAttributeList

  // 查询条件-通用属性（前端定义）
  @observable queryAttrList = []
  // 查询条件-选中的属性和字段
  @observable querySelectedList = []
  // 定制列-通用属性（前端定义）
  @observable columnAttrList = []
  // 定制列-选中的属性和字段
  @observable columnSelectedList = []
  //定义列宽
  @observable.ref columnsWidth = []
  // 查询条件-私有字段
  @observable checkFilterModelList = []
  // 定制列-私有字段
  @observable columnsModel = []

  // 重置筛选和cloumns
  @action resetFilter = () => {
    this.checkFilterList = []
    this.attributeList = defaultAttributeList
    this.querySelectedList = []
    this.columnSelectedList = []
    this.columnsWidth = []
  }
  @action setColumnWidth = (arr) => {
    runInAction(() => {
      this.columnsWidth = arr
    })
  }
  // 保存或更新 查询器或分组
  @action async saveMenuList(data) {
    const res = await axios.post(API.saveMenuList, data)
    return res
  }

  @action async queryFieldInfo(codes, queryCodes, columnCodes) {
    const res = await axios.get(API.queryFieldDetailsByCodes, {
      params: { codes: _.uniq(codes).join() }
    })
    const queryListAll = _.cloneDeep(_.concat([], [...toJS(this.queryAttrList)], res))
    const queryList = getList(queryCodes, queryListAll)
    this.querySelectedList = queryList.filter((item) => item.type)
    const columnListAll = _.cloneDeep(_.concat([], [...toJS(this.columnAttrList)], res))
    const columnList = getList(columnCodes, columnListAll)
    this.columnSelectedList = columnList.filter((item) => item.name)
    this.setSelectedList(this.columnSelectedList, 'COLUMN')
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
    } else if (type === 'COLUMN') {
      this.columnSelectedList = list
      if (_.isEmpty(this.columnsWidth)) {
        this.columnsWidth = _.map(list, (d) => ({
          name: d.name,
          code: d.code,
          width: getWidthBycode(d.code, d.type)
        }))
      }
    }
  }

  // 获取查询器/分组详情
  @action async getMenuDetail(id) {
    const res = await axios.get(API.getMenuDetail, { params: { id: id } })
    let overdue = _.get(res, 'queryMenuView.overdue')
    if (overdue) {
      if (_.isString(overdue)) {
        overdue = [Number(overdue)]
      } else if (_.isArray(overdue)) {
        overdue = _.map(overdue, (item) => Number(item))
      }
      _.set(res, 'queryMenuView.overdue', overdue)
    }
    if (res.queryMenuView) {
      const { extParams = {}, checkFilterList = [] } = res.queryMenuView
      this.setAttributeList(extParams.columns)
      // this.queryFieldInfosByCodes(extParams.columns || [], 'COLUMN')
      let filters = checkFilterList
      if (_.isEmpty(checkFilterList)) {
        filters = _.filter(
          _.concat(Object.keys(res.queryMenuView), Object.keys(extParams)),
          (filter) => filter !== 'extParams' && filter !== 'columns' && filter !== 'checkFilterList'
        )
        this.setCheckFilterList(filters)
      } else {
        this.setCheckFilterList(checkFilterList)
      }
      // this.queryFieldInfosByCodes(filters || [] , 'QUERY')
    } else {
      this.setCheckFilterList([])
    }
    if (res.queryMenuView) {
      const { querySelectedList, columnSelectedList, selectedColumnsWidth } = res.queryMenuView
      if (querySelectedList && selectedColumnsWidth) {
        selectedColumnsWidth.forEach((d) => {
          if (typeof d.width == 'number') {
            d.width = getWidthBycode(d.code, d.type, d.width)
          } else if (typeof d.width === 'object') {
            d.width = getWidthBycode(d.code, d.type, d.width.widthNum, d.width.widthType)
          }
        })
        this.columnsWidth = selectedColumnsWidth
        this.setSelectedList(querySelectedList || [], 'QUERY')
        this.setSelectedList(columnSelectedList || [], 'COLUMN')
      } else {
        // 兼容老数据
        const { extParams = {}, checkFilterList } = res.queryMenuView
        const columns = extParams.columns || []
        const filterKey = ['extParams', 'columns', 'orderField', 'checkFilterList', 'lockCondition']
        const keys = _.concat(_.keys(res.queryMenuView), _.keys(extParams))
        const queryList = checkFilterList
          ? checkFilterList
          : _.filter(keys, (item) => filterKey.indexOf(item) > -1)
        const queryListCode = queryList.map((item) => {
          return { code: item, value: res.queryMenuView[item] || extParams[item] }
        })
        this.queryFieldInfo(
          _.concat(columns, queryList),
          queryListCode,
          columns.map((item) => {
            return { code: item }
          })
        )
      }
    }
    return res
  }

  @action async getMenuGroup() {
    const res = await axios.get(API.getMenuGroup)
    this.groupList = res
  }

  // 设置选中的筛选项
  @action setCheckFilterList(checkFilterList) {
    this.checkFilterList = checkFilterList
  }

  @action setAttributeList(attributeList) {
    this.attributeList = attributeList || defaultAttributeList
  }

  @action async getModelAndTacheIdList() {
    const res = (await axios.get(API.getModelAndTache)) || {}
    runInAction(() => {
      this.modelAndTacheIdList = res || []
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

  // 获取所有字段
  @action async getAllColumns() {
    const res = (await axios.get(API.getAllColumns)) || {}
    runInAction(() => {
      const { builtinFields = [], extendedFields = [] } = res
      this.allField = {
        ...this.allField,
        builtinFields: builtinFields,
        extendedFields:
          _.filter(extendedFields, (item) => _.includes(BUILTIN_FIELD_TYPE, item.type)) || []
      }
    })
  }

  //根据code查询字段类型
  @action async queryFieldType(codes) {
    const res = (await axios.get(API.queryFieldType, { params: { codes } })) || []
    let mapCodeType = new Map()
    let mapTypeDesc = new Map()
    _.forEach(res, (d) => {
      mapCodeType.set(d.code, d.type)
      mapTypeDesc.set(d.code, d.typeDesc)
    })
    let newData = _.cloneDeep(this.columnsWidth)
    _.forEach(newData, (d) => {
      if (mapCodeType.has(d.code)) {
        d.type = mapCodeType.get(d.code)
        d.typeDesc = mapTypeDesc.get(d.code)
      } else {
        let { type, typeDesc } = getFieldType(d.code)
        d.type = type
        d.typeDesc = typeDesc
      }
    })
    this.setColumnWidth(newData)
  }
}
export default ListStore
