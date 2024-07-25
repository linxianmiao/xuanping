import { action, runInAction, observable, toJS } from 'mobx'
import setProps from '~/utils/setProps'
// 模型列表
class Modal {
  // 创建工单用
  @observable modelList = []

  @observable slothList = []

  @observable serviceList = []

  // 模型列表的模型列表
  @observable.ref confModelList = []

  @observable.ref waitModelList = [] // 待审核模型列表

  @observable modelTagsList = [] // 模型tags信息

  // @observable query = {
  //   pageNo: 1,
  //   pageSize: 20,
  //   kw: undefined,
  //   layoutId: undefined,
  //   classification: undefined
  // } // 模型管理模型列表得筛选条件

  @observable total = 0 // 模型管理模型列表得总数

  @observable waitModelTotal = 0 // 待审核模型总数
}

class ModelList extends Modal {
  @observable loading = false

  @observable query = this.getInitialQuery() // 模型管理模型列表得筛选条件

  @observable reviewQuery = this.getInitialReviewQuery() // 待审核模型管理模型列表得筛选条件

  // 选中的模型类型
  @observable selectedModelType = undefined

  // 选中的所属应用
  @observable selectedApp = undefined

  // 模型类型信息
  @observable categoryList = []

  // 模型分组
  @observable groupList = []

  @observable isShowModelsByGroups = false

  getInitialQuery() {
    return {
      pageNo: 1,
      pageSize: 20,
      kw: undefined,
      layoutId: undefined,
      classification: undefined
    }
  }

  getInitialReviewQuery() {
    return {
      pageNo: 1,
      pageSize: 20,
      kw: undefined,
      applyType: undefined
    }
  }

  @action async changeShared (shared, id) {
    const res = await axios.get(API.modelsetShared, { params: { modelId: id, shared } })
    return res
  }

  // 获取创建工单的模型列表,(全量数据，带分组)
  @action async getLayoutModelList() {
    const res = await axios.get(API.GET_MODEL_LAYOUT)
    return res
  }

  // 获取创建工单的模型列表，（滚动加载模式）
  @action async getModelList(query) {
    const res = await axios.get(API.getAuthModelsByUser, { params: query }) || {}
    const { list } = res
    runInAction(() => {
      if (query.pageNo === 1) {
        this.modelList = list
      } else {
        this.modelList = [...this.modelList, ...list]
      }
    })
    return res
  }

  // 获取模型管理的模型列表，（分页加载模式）,
  // query 不为空得情况则是其他地方调用该接口，不用重新设置模型管理数据，返回res
  @action async getConfModelList(query) {
    this.loading = true

    const res = await axios.get(API.queryModesWithPage, { params: _.isEmpty(query) ? this.query : query }) || {}
    if (_.isEmpty(query)) {
      runInAction(() => {
        this.confModelList = res.list || []
        this.total = res.total || 0
        this.loading = false
      })
    } else {
      runInAction(() => {
        this.loading = false
      })
      return res
    }
  }

  // 查询待审核模型列表
  @action async queryModelWaitingAuth(query) {
    this.loading = true

    const res = await axios.get(API.queryModelWaitingAuth, { params: _.isEmpty(query) ? this.reviewQuery : query }) || {}

    runInAction(() => {
      this.waitModelList = res.list
      this.waitModelTotal = res.total
      this.loading = false
    })
  }

  // 根据模型id获取模型信息
  @action async getModelsByIds(modelId) {
    const res = await axios.get(API.getModelsByIds, { params: { modelId } }) || {}
    return res
  }

  // 获取模型列表，触发器条件用
  @action async queryAllModels(query) {
    const res = await axios.get(API.queryAllModels, { params: query })
    return res
  }

  // 获取某个模型下得环节列表，触发器条件用
  @action async queryActivityInfos(query) {
    const res = await axios.get(API.queryActivityInfos, { params: query })
    return res
  }

  // 根据模型id和环节id获取模型和环节得名称
  @action async getModelAndActivityInfo(data) {
    const res = await axios.post(API.getModelAndActivityInfo, data)
    return res
  }

  // 获取模型列表，带分组的
  @action async queryModelsWithLayout() {
    const res = await axios.get(API.query_models_with_layout)
    return res
  }

  // 创建工单弹框模型已何种方式展示
  @action async getModelShowType() {
    const res = await axios.get(API.isShowModelsByGroups)
    runInAction(() => {
      this.isShowModelsByGroups = res || false
    })
  }

  // 获取分组列表
  @action async getGroupList (query) {
    const res = await axios.get(API.queryDictionaryData('model_layout'), { params: query }) || {}
    return res.list || []
  }

  // 新建分组
  @action async createModelLayout (data) {
    const res = await axios.post(API.save_model_layouts, data)
    return res
  }

  // 更新分组名称
  @action async updateModelLayout (data) {
    const res = await axios.post(API.update_model_layouts, data)
    this.getConfModelList()
    return res
  }

  // 移动模型到组
  @action async moveModelLayout (value) {
    const res = await axios.post(API.move_model_to_layout, value)
    return res
  }

  // 导入
  @action async importAdvancedModel (data) {
    const res = await axios({
      url: API.importAdvancedModel,
      method: 'post',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: data
    })
    return res
  }

  // 获取模型类型列表类型
  @action async queryCategory () {
    const res = await axios.get(API.queryCategory) || []
    runInAction(() => {
      this.categoryList = res
    })
  }

  // 获取服务目录
  @action async querySrvcats () {
    const res = await axios.get(API.query_srvcats)
    runInAction(() => {
      this.slothList = res
    })
    return res
  }

  // 获取服务目录下的服务项
  @action async serviceItemsByCatlog (data) {
    const res = await axios.get(API.SERVICEITEMS_BY_CATLOG, { params: data })
    runInAction(() => {
      this.serviceList = res
    })
    return res
  }

  // 判断服务项是否在服务时间内
  @action async checkInTime (id) {
    const res = await axios.get(API.CHECK_IN_TIME, { params: { id } })
    return res
  }

  // 检测模型是否可以删除
  @action async checkDelModel (id) {
    const res = await axios.get(API.check_del_model, { params: { id } })
    return res
  }

  // 删除模型
  @action async delModel (id) {
    const res = await axios.post(`${API.delete_model}/${id}`)
    return res
  }

  // 删除模型分组
  @action async delGroup (id) {
    const res = await axios.post(`${API.delete_model_layout}/${id}`)
    return res
  }

  // 改变模型の状态
  @action async changeStatus (data) {
    const res = await axios.post(API.applyModelEnableOrDisable, data)
    return res
  }

  // 不走审核时改变模型の状态
  @action async changeModelStatus (data) {
    const res = await axios.post(API.changeModelStatusAutomic, data)
    return res
  }

  // 执行审核
  @action async doAuthModel (data) {
    const res = await axios.post(API.doAuthModel, data)
    return res
  }

  // 删除审核记录
  @action async deleteAuthComment (modelId) {
    const res = await axios.get(API.deleteAuthComment, { params: { modelId } })
    return res
  }

  @action setValue = setProps(this)

  @action dispose() {
    const data = new Modal()
    this.setValue(toJS(data))
  }

  @action resetQuery() {
    this.query = this.getInitialQuery()
    this.reviewQuery = this.getInitialReviewQuery()
    this.selectedModelType = undefined
    this.selectedApp = undefined
  }
}

export default new ModelList()