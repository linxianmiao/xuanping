import { observable, action, runInAction, toJS } from 'mobx'
import Config from '../config/flowConfig'
import { linksToLegal, defaultTacheButton } from '../component/flow/utils'
import getUid from '../../utils/uuid'
import {
  setTacheButton,
  changeLinkName,
  tacheButtonToServer
} from '../component/flow/component/TacheButton/logic'

class FlowStore {
  @observable.ref allParam = []

  @observable.ref dataSource = {}

  @observable.ref defaultStageAttrs = {}

  @observable.ref defaultData = {}

  @observable.ref userGroupFields = [] //用户组类型字段

  @observable.ref userFields = []

  // 用户类型字段
  @observable.ref departFields = []

  // 部门类型字段
  @observable.ref timeFields = []

  // 时间类型字段
  @observable.ref timeIntervalFields = []

  // 名称字段列表
  @observable.ref nodeList = []

  // 单选用户字段
  @observable.ref singleUserFields = []

  @observable isSubmit = false

  // 判断是否提交
  @observable isSubmiting = false

  @observable version = 1 // 流程图版本

  @observable.ref versionList = []

  @observable.ref sensitiveAndexecAuth = {} // 自动节点-是否展示敏感授权字段

  @observable sensitive = false // 自动节点-是否展示敏感授权字段

  @observable execAuth = [] // 自动节点-是否展示执行授权

  @observable canForceUpdate = false // 是否可以覆盖发布

  @observable stageList = [] // 所属阶段列表

  @action setAutoTaskParams(id, res) {
    if (res) {
      this.sensitiveAndexecAuth = {
        ...this.sensitiveAndexecAuth,
        [id]: res
      }
    }
  }

  // @action async getShapePanelData() {
  //   const res = await axios.get(API.isShowActivity)
  //   return res
  // }

  // 流程图版本列表
  @action async getChartVersions(modelId, chartId) {
    const res = (await axios.get(API.getChartVersions, { params: { modelId, chartId } })) || []
    runInAction(() => {
      this.versionList = res
    })
  }

  // 删除流程图版本
  @action async delChartVersions(modelId) {
    const res = await axios.get(API.deleteChartVersion, {
      params: { modelId, version: this.version }
    })
    return res
  }

  // 获取模型详情接口
  @action async getBaseModel(id) {
    const res = await axios.get(API.getBaseModel(id))
    return res
  }

  // 分页获取模型
  @action async getModelList(query) {
    const res =
      (await axios.get(API.getUseableModels, {
        params: _.assign({}, { filterUsable: true }, query)
      })) || {}
    return res.list
  }

  // 单实例流转模式的流程类型
  @action async getProcessList(params) {
    const res = await axios.get(API.getProcessChartList, { params })
    return res.list
  }

  // 判断提交请求
  @action changeSubmit = (data) => {
    this.isSubmit = data
  }

  @action getAllParamList = (data) => {
    axios.get(API.queryParamList, { params: data }).then((res) => {
      this.allParam = res.list
    })
  }

  @action destroy() {
    // this.dataSource = Config.dataSource
    this.isSubmit = false
  }

  @action next = (dataSource) => {
    this.dataSource = _.cloneDeep(dataSource)
  }

  /**
   * id 节点id
   * key 要设置的key
   * value 对应key的value
   * type 节点类型 ['links', 'nodes']
   */
  @action setStageAttr = (data) => {
    this.defaultStageAttrs = data
  }

  @action setItem = (id, item, type) => {
    const dataSource = _.cloneDeep(this.dataSource)
    dataSource[type].map((ite, index) => {
      if (ite.id === id) {
        dataSource[type][index] = _.cloneDeep(item)
      }
    })
    this.dataSource = dataSource
  }

  @action setAttr = (id, key, value, type, activityFlowId) => {
    const dataSource = _.cloneDeep(this.dataSource)
    dataSource[type].map((item) => {
      if (item.id === id) {
        item[key] = value
      }
    })
    // 线的名称和节点中线的按钮名称需同步
    changeLinkName(dataSource, id, type, activityFlowId)
    this.dataSource = dataSource
  }

  @action getParamFieldList = () => {
    axios
      .get(API.querySpecifyFields, {
        params: { typeList: 'user,department,userGroup,dateTime,timeInterval' }
      })
      .then((res) => {
        const userFields = []
        const departFields = []
        const userGroupFields = []
        const timeFields = []
        const timeIntervalFields = []

        _.map(res, (item) => {
          if (item.type === 'user') {
            userFields.push(item)
          }
          if (item.type === 'department') {
            departFields.push(item)
          }
          if (item.type === 'userGroup') {
            userGroupFields.push(item)
          }
          if (item.type === 'dateTime') {
            timeFields.push(item)
          }
          if (item.type === 'timeInterval') {
            timeIntervalFields.push(item)
          }
        })
        this.userFields = userFields
        this.departFields = departFields
        this.userGroupFields = userGroupFields
        this.timeFields = timeFields
        this.timeIntervalFields = timeIntervalFields
      })
  }

  @action getSingleUserList = () => {
    axios.get(API.querySpecifyFields, { params: { typeList: 'user', isSingle: 0 } }).then((res) => {
      this.singleUserFields = res
    })
  }

  @action async getNodeList() {
    const newData = {
      pageNum: 1,
      pageSize: 10000
    }
    const res = await axios.get(API.queryListWithPagination, { params: newData })
    this.nodeList = res.list
  }

  @action getModelProcessChart = (modelId, chartId, version) => {
    axios
      .get(API.get_model_process_chart(modelId, chartId), { params: { version } })
      .then((res) => {
        let nodes = []
        let links = []
        this.defaultStageAttrs = res.defaultStageAttrs || {}
        this.version = res.version
        this.canForceUpdate = res.canForceUpdate
        if (res && res.modelFlowVos && res.modelTacheVos) {
          nodes = _.map(res.modelTacheVos, (item) => {
            delete item.key
            item.text = item.name
            item.shape = item.chartType
            item.needApproval = item.needApproval ? 1 : 0
            item.tooltipFontFamily = 'iconfont'
            item.icon =
              item.activitiType === 'UserTask'
                ? '\uea24'
                : item.activitiType === 'AutoTask'
                ? '\uea27'
                : item.activitiType === 'SubProcess'
                ? '\uea23'
                : item.activitiType === 'ExclusiveGateway'
                ? '\uea25'
                : item.activitiType === 'InclusiveGateway'
                ? '\uea22'
                : item.activitiType === 'ParallelGateway'
                ? '\ue88e'
                : item.activitiType === 'TimingTask'
                ? '\ue791'
                : item.activitiType === 'AutomaticDelivery'
                ? '\ue7de'
                : item.activitiType === 'ApprovalTask'
                ? '\ue7db'
                : item.activitiType === 'RemoteRequest'
                ? '\ue79c'
                : ''
            if (item.activitiGroupId) {
              item.groupId = item.activitiGroupId
            }
            if (item.dealRules && item.dealRules[0]) {
              if (item.dealRules[0].executor && item.dealRules[0].executor.id) {
                item.dealRules[0].executorType = item.dealRules[0].executor.type
                item.dealRules[0].executor = item.dealRules[0].executor.type
                  ? { key: item.dealRules[0].executor.id, label: item.dealRules[0].executor.name }
                  : [
                      {
                        id: item.dealRules[0].executor.id,
                        name: item.dealRules[0].executor.name,
                        type: 0
                      }
                    ]
              } else {
                item.dealRules[0].executor = {}
              }
              const sensitiveAuthor = { all: [], users: [], groups: [] }
              _.forEach(item.dealRules[0].sensitiveAuthor, (author) => {
                author.type === 1 &&
                  sensitiveAuthor.users.push({ realname: author.name, userId: author.id, type: 1 })
                author.type === 0 &&
                  sensitiveAuthor.groups.push({ name: author.name, groupId: author.id, type: 0 })
              })
              item.dealRules[0].sensitiveAuthor = sensitiveAuthor
              item.dealRules[0].executionStrategy = item.dealRules[0].executionStrategy || 0
              item.dealRules[0].executionTime = item.dealRules[0].executionTime || {
                selectType: 'value'
              }
            }
            _.map(item.relateModels, (vo) => {
              vo.label = vo.name
              vo.key = vo.id
            })
            _.map(item.coOrganizerModels, (vo) => {
              vo.label = vo.name
              vo.key = vo.id
            })
            // _.map(item.tacheButton, button => {
            //   if (button.rollbackTache) {
            //     button.rollbackTache = { label: button.rollbackTache.rollbackTacheName, key: button.rollbackTache.rollbackTacheId }
            //   }
            // })
            if (item.selectNodeNameVo) {
              item.selectNodeNameVo.label = item.selectNodeNameVo.name
              item.selectNodeNameVo.key = item.selectNodeNameVo.id
            }
            if (item.activitiType === 'ExclusiveGateway') {
              item.isDefault = 0
              _.map(item.conditionRules, (i, index) => {
                if (i.isDefault) {
                  item.isDefault = index
                }
              })
            }
            if (item.activitiType === 'UserTask' || item.activitiType === 'ApprovalTask') {
              // item.tacheButton = _.map(defaultTacheButton(item.rollbackWay, item.rollbackProcess, item.activitiType), defaultButton => {
              //   const btn = _.isEmpty(item.tacheButton) ? defaultButton : _.assign({}, defaultButton, { isUseable: 0 })
              //   return _.find(item.tacheButton || [], button => button.type === defaultButton.type) || btn
              // })
              item.tacheButton = setTacheButton(
                item.tacheButton,
                item.id,
                item.activitiType,
                res.modelFlowVos,
                res.modelTacheVos
              )
            }
            return item
          })
          links = _.map(res.modelFlowVos, (item) => {
            item.text = item.name
            item.visibleText = item.showName
            item.attr = 'line'
            _.map(item.variableVos, (vo) => {
              if (vo.selectType === 'fields') {
                _.map(vo.values, (val) => {
                  val.label = val.name
                  val.key = val.id
                })
              }
            })
            return Object.keys(item.from || {}).length !== 0 ? item : linksToLegal(item, nodes)
          })
        }
        if (nodes.length > 0 || links.length > 0) {
          this.dataSource = { nodes, links }
          this.defaultData = { nodes, links }
        } else {
          _.map(Config.nodes, (val) => {
            val.id = getUid()
          })
          this.dataSource = {
            nodes: Config.nodes,
            links: []
          }
          this.defaultData = {
            nodes: Config.nodes,
            links: []
          }
        }
      })
  }

  @action saveFlow = async (
    modelId,
    type,
    flowMes,
    forceUpdate,
    chartId,
    chartType,
    processes = []
  ) => {
    const dataSource = _.cloneDeep(this.dataSource)
    this.isSubmiting = true
    // 提交的节点数据
    const modelTacheVos = _.map(dataSource.nodes, (item) => {
      item.name = item.text
      item.chartType = item.shape
      item.needApproval = !!item.needApproval
      item.activitiGroupId = item.groupId
      item.selectNodeNameVo = item.selectNodeNameVo
        ? { name: item.selectNodeNameVo.label, id: item.selectNodeNameVo.key }
        : null
      if (item.dealRules && item.dealRules[0]) {
        if (
          !_.isEmpty(item.dealRules[0].executor) &&
          (item.dealRules[0].executor.key || item.dealRules[0].executor[0].id)
        ) {
          item.dealRules[0].executor = item.dealRules[0].executorType
            ? {
                id: item.dealRules[0].executor.key,
                name: item.dealRules[0].executor.label,
                type: 1
              }
            : {
                id: item.dealRules[0].executor[0].id,
                name: item.dealRules[0].executor[0].name,
                type: 0
              }
          delete item.dealRules[0].executorType
        } else {
          item.dealRules[0].executor = {}
          delete item.dealRules[0].executorType
        }
        if (item.dealRules[0].sensitiveAuthor) {
          const sensitiveAuthorUser = _.map(item.dealRules[0].sensitiveAuthor.users, (author) => ({
            name: author.realname,
            id: author.userId,
            type: '1'
          }))
          const sensitiveAuthorGroup = _.map(
            item.dealRules[0].sensitiveAuthor.groups,
            (author) => ({
              name: author.name,
              id: author.groupId,
              type: '0'
            })
          )
          item.dealRules[0].sensitiveAuthor = _.concat(sensitiveAuthorUser, sensitiveAuthorGroup)
        }
        // delete item.dealRules[0].autoName

        if (item.dealRules[0].childMode === 1) {
          // 选择单实例时，childModel.id去当前modelId，subChartId取选中子流程的id
          const mode = processes.find((p) => p.id === item.dealRules[0].childModel.id)
          if (mode) {
            item.dealRules[0].subChartId = mode.id
          }
          item.dealRules[0].childModel.id = modelId
        } else if (item.dealRules[0].childMode === 0) {
          // 选择多实例时，subChartId清空值
          item.dealRules[0].subChartId = ''
        }
      }
      item.relateModels = _.map(item.relateModels, (vo) => ({ name: vo.label, id: vo.key }))
      item.coOrganizerModels = _.map(item.coOrganizerModels, (vo) => ({
        name: vo.label,
        id: vo.key
      }))
      if (item.activitiType === 'ExclusiveGateway') {
        item.isDefault = item.isDefault || 0
        item.conditionRules = _.map(item.conditionRules, (i, index) => {
          i.isDefault = item.isDefault === index
          return i
        })
      }
      item.outGoings = _.compact(
        _.map(dataSource.links, (link) => (item.id === link.from.id ? link.id : null))
      )
      // _.map(item.tacheButton, button => {
      //   if (button.rollbackTache) {
      //     button.rollbackTache = { rollbackTacheName: button.rollbackTache.label, rollbackTacheId: button.rollbackTache.key }
      //   }
      // })
      if (item.tacheButton) {
        item.tacheButton = tacheButtonToServer(item.tacheButton)
      }
      if (item.activitiType === 'AutoTask') {
        item.policy = 3
      }
      return _.omit(item, [
        'groupId',
        'text',
        'type',
        'tooltipFontFamily',
        'icon',
        'style',
        'shape',
        'active',
        'isDefault'
      ])
    })
    // 提交的线数据
    const modelFlowVos = _.map(dataSource.links, (item) => {
      _.map(item.variableVos, (vo) => {
        if (vo.selectType === 'fields') {
          vo.values = _.map(vo.values, (val) => ({ name: val.label, id: val.key }))
        }
      })
      const startxy = {}
      const endxy = {}
      const startwh = {}
      const endwh = {}
      // 线坐标
      _.forEach(dataSource.nodes, (item1) => {
        if (item.from.id === item1.id) {
          startwh.x = item1.width / 2
          startwh.y = item1.height / 2
          switch (item.from.direction) {
            case 'bottom':
              startxy.x = item1.x + startwh.x
              startxy.y = item1.y + item1.height
              break
            case 'top':
              startxy.x = item1.x + startwh.x
              startxy.y = item1.y
              break
            case 'left':
              startxy.x = item1.x
              startxy.y = item1.y + startwh.y
              break
            case 'right':
              startxy.x = item1.x + item1.width
              startxy.y = item1.y + startwh.y
              break
          }
        }
        if (item.to.id === item1.id) {
          endwh.x = item1.width / 2
          endwh.y = item1.height / 2
          switch (item.to.direction) {
            case 'bottom':
              endxy.x = item1.x + endwh.x
              endxy.y = item1.y + item1.height
              break
            case 'top':
              endxy.x = item1.x + endwh.x
              endxy.y = item1.y
              break
            case 'left':
              endxy.x = item1.x
              endxy.y = item1.y + endwh.y
              break
            case 'right':
              endxy.x = item1.x + item1.width
              endxy.y = item1.y + endwh.y
              break
          }
        }
      })
      item.name = item.text
      item.showName = item.visibleText
      item.locations = [startxy, endxy]
      item.dockers = [startwh, endwh]
      return _.omit(item, ['text', 'visibleText', 'attr', 'active'])
    })
    const res = await axios({
      url: API.saveModelProcessChart,
      method: 'post',
      params: {
        forceUpdate,
        release: type === 'publish'
      },
      data: {
        modelId,
        chartId,
        chartType,
        modelTacheVos,
        modelFlowVos,
        message: flowMes,
        version: this.version,
        defaultStageAttrs: this.defaultStageAttrs
      }
    })
    this.isSubmiting = false
    return res
  }

  // 不走审核时改变模型の状态
  @action async changeModelStatus(data) {
    const res = await axios.post(API.changeModelStatusAutomic, data)
    return res
  }

  // 目标系统
  @action async remoteDockingList(params) {
    const res = (await axios.get(API.remoteDockingList, { params: { ...params } })) || {}
    return res?.list || []
  }

  // 目标模型
  @action async queryRemoteModelList(params) {
    const res = (await axios.get(API.queryRemoteModelList, { params: { ...params } })) || {}
    return res || []
  }

  // 目标确认环节
  @action async queryRemoteActivityList(params) {
    const res = (await axios.get(API.queryRemoteActivityList, { params: { ...params } })) || {}
    return res || []
  }

  // 所属阶段列表
  @action async querySatageList(modelId) {
    const res = (await axios.get(API.getStageList, { params: { modelId } })) || {}
    this.stageList = res || []
  }
}

export default FlowStore
