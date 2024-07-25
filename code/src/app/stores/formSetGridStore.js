import { observable, action, runInAction } from 'mobx'

// 表单设计器
class FormSetGrid {
  @observable.ref errors = {} // 错误信息

  @observable.ref gridList = [] // 表单列表

  @observable.ref fieldList = [] // 当前字段

  @observable.ref allFields = [] // 所有字段

  @observable.ref allTimeFields = [] // 所有时间字段

  @observable currentGrid = {
    fieldList: [],
    formLayoutVos: []
  } // 当前表单

  @observable loading = false

  @observable type = 'template'

  @observable.ref simpleTemplates = [] // 启用的模板

  @observable count = 0 // 模板总数

  @observable query = {
    kw: undefined,
    layoutId: undefined,
    current: 1,
    pageSize: 20
  }

  // 表单列表搜索关键字
  @observable formListKw = undefined

  @observable.ref sourceList = [] // 来源列表

  @observable parameter = [] // 新建表单的时候用的外部表单用的参数

  @observable subFormVariableList = [] // 子表单可用的变量列表

  // 获取外部表单用的参数
  @action.bound
  async getParameter() {
    const res = await axios.get(API.listBuiltinFieldParam)
    runInAction(() => {
      this.parameter = res || []
    })
  }

  // 获取子表单控件使用的变量列表
  @action.bound
  async getrelatedService(modelId) {
    const res = await axios.get(API.relatedService, { params: { modelId } })
    runInAction(() => {
      this.subFormVariableList = _.get(res, 'list', [])
    })
    return res
  }

  // 获取跨域字段来源列表
  @action
  async getSourceList() {
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

  // 获取模板列表
  @action.bound
  async getGridList(id) {
    this.loading = true
    let res
    if (this.type === 'template') {
      const query = _.omit(this.query, 'layoutInfo')
      query.layoutId = _.get(this.query, 'layoutInfo.id')
      res = (await axios.get(API.getListFormTemplates, { params: query })) || {}
      runInAction(() => {
        this.gridList = res.list || []
        this.count = res.counts
        this.loading = false
      })
    } else {
      res = await axios.get(API.queryModelForms(id), { params: { kw: this.formListKw } })
      runInAction(() => {
        this.gridList = res || []
        this.loading = false
      })
    }
  }

  // 获取模型启用字段
  @action.bound
  async getFieldList(modelId) {
    let res
    if (this.type === 'template') {
      res = await axios.get(API.get_all_field, { params: { pageNo: 1, pageSize: 5000 } })
      runInAction(() => {
        this.fieldList = res || []
        this.allFields = res || []
      })
    } else {
      res = await axios.get(API.queryModelFields, { params: { modelId } })
      runInAction(() => {
        this.fieldList = res || []
        // 用于字段联动条件
        this.allFields = res || []
        this.allTimeFields = (res || []).filter((item) => item.type === 'dateTime')
      })
    }
  }

  // 获取所有启用的模板
  @action.bound
  async getlistSimpleTemplates() {
    const res = await axios.get(API.getlistSimpleTemplates)
    runInAction(() => {
      this.simpleTemplates = res || []
    })
  }

  // 改变模板启用状态
  @action.bound
  async changeFormTemplateStatus(id, status) {
    const res = await axios.get(API.changeFormTemplateStatus(id, status))
    return res
  }

  // 删除模板
  @action.bound
  async deleteGard(id) {
    const res = await axios.post(API.deleteModelForm(id))
    return res
  }

  // 将普通表单发布为模板表单
  @action.bound
  async publishFormTemplate(id) {
    const res = await axios.get(API.publishFormTemplate(id))
    return res
  }

  // 滚动获取字段
  @action.bound
  async listFieldWithPage(query) {
    const res = await axios.get(API.list_field_With_page, { params: query })
    return res
  }

  // 获取表单详情
  @action.bound
  async getModelForm(formId, modelId, currentModal, type) {
    let res
    if (this.type === 'template') {
      res = await axios.get(API.getModelForm, { params: { formId } })
    } else {
      res = await axios.get(API.getModelForm, { params: { modelId, formId } })
    }
    if (!res) return
    // 将字段进行排序（选中的放在前边，没有选中的放后边）
    const { fieldList } = res
    const codes = _.map(fieldList, (field) => field.code) // 遍历获取禁止拖拽的字段
    const topFields = _.filter(this.fieldList, (field) => _.includes(codes, field.code))
    const bottemFields = _.filter(this.fieldList, (field) => !_.includes(codes, field.code))

    // 处理模板数据
    const formLayoutVos = _.map(res.formLayoutVos, (formLayout) => {
      if (formLayout.type === 'template') {
        const { formLayoutVos = [], fieldList = [] } = formLayout.modelFormVo || {}
        return _.assign({}, formLayout, { formLayoutVos, fieldList })
      }
      return formLayout
    })
    runInAction(() => {
      this.fieldList = [...topFields, ...bottemFields]
      if (type === 'copy') {
        this.currentGrid = _.assign({}, res, { formLayoutVos }, currentModal, {
          id: null,
          status: 0
        })
      } else {
        this.currentGrid = _.assign({}, res, { formLayoutVos })
      }
    })
  }

  // 保存表单
  @action.bound
  async saveModelForm(data) {
    let res
    if (data.id) {
      res = await axios({
        method: 'post',
        url: API.updateModelForm,
        data
      })
    } else {
      res = await axios.post(API.saveModelForm, data)
    }
    return res
  }

  // 获取字段分组
  @action.bound
  async getLayouts() {
    const res = await axios.get(API.query_field_layouts)
    return res
  }

  // 保存模型列表字段库
  @action.bound
  async saveModelFields(data) {
    await axios.post(API.saveModelFields, data)
    this.getFieldList(data.modelId)
  }

  // 改变字段列表
  @action.bound
  changeFields(fields, layoutIndex, tabsIndex, parentType, field, type) {
    if (parentType === 'tab') {
      this.currentGrid.formLayoutVos[layoutIndex].tabs[tabsIndex].fieldList = fields
    } else if (parentType === 'group' || parentType === 'panel') {
      this.currentGrid.formLayoutVos[layoutIndex].fieldList = fields
    }
    if (type === 'add') {
      this.currentGrid.fieldList = [...this.currentGrid.fieldList, field]
    }
  }

  // 删除字段
  @action.bound
  deleteField(layoutIndex, tabsIndex, fieldIndex, parentType, codes) {
    if (parentType === 'layout') {
      this.currentGrid.formLayoutVos.splice(layoutIndex, 1)
    } else if (parentType === 'tab') {
      this.currentGrid.formLayoutVos[layoutIndex].tabs[tabsIndex].fieldList.splice(fieldIndex, 1)
    } else {
      this.currentGrid.formLayoutVos[layoutIndex].fieldList.splice(fieldIndex, 1)
    }
    if (codes) {
      this.currentGrid.fieldList = _.filter(
        this.currentGrid.fieldList,
        (field) => !_.includes(codes, field.code)
      )
    }
  }

  // 改变字段属性
  @action.bound
  changeField(layoutIndex, tabsIndex, fieldIndex, parentType, data, dataType) {
    if (parentType === 'layout') {
      if (dataType === 'linkage') {
        this.currentGrid.formLayoutVos[layoutIndex].linkageStrategyVos = data.linkageStrategyVos
      } else {
        this.currentGrid.formLayoutVos[layoutIndex] = data
      }
    } else if (parentType === 'group' || parentType === 'panel') {
      this.currentGrid.formLayoutVos[layoutIndex].fieldList[fieldIndex] = data
    } else if (parentType === 'tab') {
      this.currentGrid.formLayoutVos[layoutIndex].tabs[tabsIndex].fieldList[fieldIndex] = data
    }
  }

  @action.bound
  setData(data, type) {
    this[type] = data
  }

  @action.bound
  async getModelList(query) {
    const res =
      (await axios.get(API.getUseableModels, {
        params: _.assign({}, { filterUsable: true }, query)
      })) || {}
    return res.list
  }
}

export default new FormSetGrid()
