import { observable, action, runInAction, toJS } from 'mobx'
import { store as runtimeStore } from '@uyun/runtime-react'
import getURLParam from '~/utils/getUrl'
import { qs } from '@uyun/utils'

export default class ResourceStore {
  static resourcepermission

  @observable permission = true

  // 是否有cmdb权限
  @observable resourceDatas = []
  @observable initialResourceValue = []

  @observable.ref checkedList = []

  // 当前选中的定制列
  @observable.ref allList = []

  // 可选的定制列
  @observable topologyBase = []

  @observable hasCMDBEditPermission = []

  @observable sandboxId = ''

  @action distory() {
    this.resourceDatas = []
    this.checkedList = [] // 当前选中的定制列
    this.allList = [] // 可选的定制列
    this.topologyBase = []
    this.sandboxId = ''
  }

  @action setSandboxID = (id) => {
    runInAction(() => {
      this.sandboxId = id
    })
  }

  // 计划删除
  @action async planToDelete(ticketId, sandboxId, resourceId, code) {
    const res = await axios.post(
      API.PLAN_TO_DELETE_CI,
      qs.stringify({
        ticketId,
        sandboxId,
        resourceId,
        fieldType: code
      })
    )
    return res
  }

  // 获取cmdb资源tree

  @action async cmdbRepoModelClassTree() {
    const res = axios.get({
      method: 'GET',
      url: '/cmdb/api/v3/categories/repoModelClassTree',
      params: {}
    })
    return res
  }

  // 创建沙箱任务
  @action async createCMDBSanbox(ticketId) {
    const res = await axios.get(API.CREATESANDBOX, {
      params: {
        ticketId
      }
    })
    runInAction(() => {
      this.sandboxId = res.sandboxId
    })
    return res
  }

  // 是否有编辑权限
  @action async isEditResource(ticketId, resourceId, fieldCode) {
    const res = await axios({
      url: API.ISEDITRESOURCE,
      method: 'get',
      params: { ticketId, resourceId, fieldCode },
      paramsSerializer: (params) => qs.stringify(params, { indices: false })
    })
    return res
  }
  //cmdb沙箱数据存taskid
  @action async saveTasks(params) {
    await axios.post(API.resourceSaveTask, { ...params })
  }
  // 沙箱中删除任务
  @action async removeRelateResource(taskIds, ticketId) {
    const res = await axios.post(API.REMOVESANDBOXTASK, { taskIds, ticketId })
    return res
  }

  // 配置项比较
  @action async compareContent(taskId) {
    const res = await axios.post(API.COMPARERESOURCE, qs.stringify({ taskId }))
    return res
  }
  //设置详情刚打开时的配置项的值以便退出时删除未保存的数据
  @action async setDefaultValue(arr) {
    runInAction(() => {
      this.initialResourceValue = arr
    })
  }

  // 查询配置项的定制列
  @action async queryColumns() {
    const res = await axios.get(API.RES_QUERYCOLUMNS)
    return res
  }

  // 提交配置项的数据
  @action postResList(id, modelId = '') {
    const filtedResourceDatas = _.forEach(toJS(this.resourceDatas), (res) => {
      res.data = _.filter(res.data, (d) => d.status !== '8' && !d.taskId)
      res.resList = _.filter(res.resList, (d) => d.status !== '8' && !d.taskId)
    })

    const resourceDatas = _.map(filtedResourceDatas, (item) => {
      const resList = _.map(item.resList, (res) =>
        _.pick(res, ['id', 'name', 'status', 'className', 'taskId', 'sandboxId'])
      )
      return _.assign({}, item, { resList })
    })
    axios.post(API.POSTRESLIST(id), {
      modelId: modelId,
      resChartRelationDataVos: toJS(this.topologyBase),
      resRelatonDataVos: resourceDatas
    })
  }

  @action getDMDBEditPermission = async (ciids, checkEditPermission) => {
    const { tenantId, userId } = runtimeStore.getState().user
    const params = {
      ciIds: ciids,
      checkEditPermission,
      tenantId,
      userId
    }
    const res = (await axios.get(API.getCMDBPermisssionByids, { params })) || []
    runInAction(() => {
      this.hasCMDBEditPermission = _.chain(res)
        .filter((d) => d.editable !== false)
        .map((d) => d.id)
        .value()
    })
  }

  // 获取配置项数据
  @action getResList(id, data, resourceFields) {
    if (id) {
      axios.get(API.GETRESLIST(id), { params: data }).then((data) => {
        runInAction(() => {
          const resourceIds = []
          let sandboxId = ''
          _.map(data.resRelatonDataVos, (item) => {
            if (item.resList) {
              _.map(item.resList, (list) => {
                resourceIds.push(list.id)
                if (!sandboxId && !_.includes(['2', '7'], list.status) && list.sandboxId) {
                  sandboxId = list.sandboxId
                }
              })
            }
          })
          if (!sandboxId) {
            _.forEach(data.resChartRelationDataVos, (item) => {
              if (
                item &&
                item.resChartRelationVos &&
                item.resChartRelationVos.sandboxId &&
                item.resChartRelationVos.chartStatus !== '3'
              ) {
                sandboxId = item.resChartRelationVos.sandboxId
              }
            })
          }
          let resources = data.resRelatonDataVos || []
          const cmdbPermissionFields = _.filter(resources, (d) => resourceFields.includes(d.code))
          let ciids = []
          _.forEach(cmdbPermissionFields, (d) => {
            _.forEach(d.data, (d2) => {
              ciids.push(d2.id)
            })
          })
          if (ciids.length > 0) {
            this.getDMDBEditPermission(ciids.join(','))
          }
          // this.sandboxId = sandboxId
          this.resourceDatas = data.resRelatonDataVos
          this.topologyBase = data.resChartRelationDataVos
          this.resourceIds = resourceIds
        })
      })
    } else {
      runInAction(() => {
        // this.sandboxId = getURLParam('sandboxId') || ''
        this.resourceIds = []
        this.resourceDatas = []
        this.topologyBase = []
      })
    }
  }

  @action getCMDBeditPermission = async (ciids) => {
    const res = await axios.get(API.getCMDBPermisssionByids)
  }

  // sourceID 针对 Alert 创建工单
  @action async getCMDBResources(sourceId, resourceCodes, AssetUpType, assetStorageType) {
    const res = await axios.get(API.GETCMDBRESOURCES(sourceId))
    const resourceIds = _.filter(res, (item) => _.map(item.resList, (list) => list.id))
    let resourceDatas = []
    // AssetUpType, assetStorageType  加了这两个字段，区分领用上架和验收上架，以免模型里有这两个字段时都给赋值
    if (AssetUpType === 'use') {
      if (resourceCodes.includes('upAssets')) {
        resourceDatas = [_.assign({}, res[0], { code: 'upAssets' })]
      } else {
        resourceDatas = [_.assign({}, res[0], { code: 'resource' })]
      }
    } else if (assetStorageType === 'checkInStorage') {
      resourceDatas = [_.assign({}, res[0], { code: 'receiveAssets' })]
    } else {
      resourceDatas = _.map(resourceCodes, (item) => _.assign({}, res[0], { code: item }))
    }
    runInAction(() => {
      this.resourceIds = resourceIds
      this.resourceDatas = resourceDatas
    })
    return res
  }

  // 判断配置项的权限
  @action.bound
  async checkUserPermission() {
    if (ResourceStore.resourcepermission !== undefined) {
      this.permission = ResourceStore.resourcepermission
    } else {
      const res = await axios.get(API.CHECKUSERPERMISSION)
      runInAction(() => {
        ResourceStore.resourcepermission = res
        this.permission = res
      })
    }
  }

  // 更新配置项数据
  @action async updateResourceDatas(data, code) {
    const resourceDatas = toJS(this.resourceDatas)
    const idx = _.findIndex(resourceDatas, (resource) => resource.code === code)
    if (idx !== -1) {
      resourceDatas.splice(idx, 1, data)
    } else {
      resourceDatas.push(data)
    }
    runInAction(() => {
      this.resourceDatas = resourceDatas
    })
    return resourceDatas
  }

  // 查询新增的配置项
  @action async querySandbox(sandboxId, fieldType, params) {
    const res = await axios({
      url: API.querySandbox,
      method: 'get',
      params: { ...params, sandboxId, fieldType },
      paramsSerializer: (params) => qs.stringify(params, { indices: false })
    })
    return res
  }

  @action async queryCis(data) {
    const res = await axios.post(API.queryCis, data)
    return res
  }

  @action async queryAllResType(data) {
    const res = await axios.get(API.queryAllResType, { params: data })
    return res
  }

  @action async queryAssetExpand(data) {
    const res = await axios.get(API.queryCiAttributes, { params: data })
    return res
  }

  // 获取部署图的缩略图
  @action async getChartUrl(data) {
    const res = await axios.get(API.getChartUrl, { params: data })
    runInAction(() => {
      this.topologyBase = _.unionBy([].concat(res, toJS(this.topologyBase)), 'topologyCode')
    })
    return res
  }

  // 查询部署图
  @action async queryChartSandbox(data, field) {
    const res = await axios.get(API.queryChartSandbox, { params: data })
    const chartData = {
      thumbnail: res.thumbnail,
      chartId: res.id,
      chartName: res.name,
      chartType: data.chartType,
      sandboxId: res.sandboxId,
      taskId: res.taskId,
      chartStatus: field.chartStatus,
      resourceCode: field.bindField
    }
    runInAction(() => {
      const topologyBase = toJS(this.topologyBase)
      if (_.some(topologyBase, (item) => item.topologyCode === data.fieldType)) {
        this.topologyBase = _.map(topologyBase, (item) => {
          if (item.topologyCode === data.fieldType) {
            return _.assign({}, item.resChartRelationVos, chartData)
          }
          return item
        })
      } else {
        this.topologyBase = [
          ...topologyBase,
          { topologyCode: data.fieldType, resChartRelationVos: chartData }
        ]
      }
    })
    return res
  }

  @action setChartStatus() {
    this.topologyBase = _.map(toJS(this.topologyBase), (item) => {
      if (item.resChartRelationVos.chartType === '1') {
        item.resChartRelationVos.chartStatus = '3'
      }
      return item
    })
  }
}
