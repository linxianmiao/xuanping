import { observable, action, runInAction } from 'mobx'

class BasicInfo {
  @observable modelManager = []

  // 管理员
  @observable layoutsList = []

  // 分组列表
  @observable modelData = {
    iconName: 'alter'
  }

  @observable categoryList = []

  @observable authorizedUsers = [] // 授权用户管理组新的参数

  @observable isShared = 0 // 是否跨域

  @observable childModel = 0 // 是否仅作为子流程

  @observable modelStatus = -1 // 模型状态

  @action setShared (data) {
    this.isShared = data
  }

  @action changeChildModel (data) {
    this.childModel = data
    if (data) {
      this.isShared = 0// 仅作为子流程时 不能跨域
    }
  }

  @action setManagerList (data) {
    this.modelManager = data
  }

  @action setUserAndGroup (data) {
    this.authorizedUsers = data
  }

  @action closeTags (index) {
    this.authorizedUsers.splice(index, 1)
  }

  @action getLayoutsList () {
    axios.get(API.query_layouts).then(res => {
      this.layoutsList = res
    })
  }

  // 保存模型
  @action async saveBaseModel (data, callback) {
    data.authorizedUsers = _.map(this.authorizedUsers, user => {
      if (user.type === 6) {
        user = _.omit(_.assign({}, user, { matrixId: user.id }), 'id')
      }
      return user
    })
    data.modelManager = this.modelManager
    const res = await axios.post(API.saveBaseModel, data)
    if (res && res.length > 30) {
      callback && callback()
    }
    return res
  }

  // 获取模型信息
    @action async getBaseModel (id) {
    const res = await axios.get(API.getBaseModel(id))
    runInAction(() => {
      this.authorizedUsers = _.map(res.authorizedUsers, user => {
        if (user.type === 6) {
          user = _.omit(_.assign({}, user, { id: user.matrixId }), 'matrixId')
        }
        return user
      })
      this.modelManager = res.modelManager
      this.isShared = res.isShared
      this.modelStatus = res.modelStatus
      if (res.modelTypeVo) {
        res.modelTypeVo.key = res.modelTypeVo.code
        res.modelTypeVo.label = res.modelTypeVo.name
      }
      if (res.layoutInfoVo) {
        res.layoutInfoVo.key = res.layoutInfoVo.id
        res.layoutInfoVo.label = res.layoutInfoVo.name
      }
      this.modelData = res || {}
    })
    return res
  }

  // 获取模型类型列表
  @action async queryCategory () {
      const res = await axios.get(API.queryCategory) || []
      runInAction(() => {
        this.categoryList = res
      })
    }
}

export default BasicInfo
