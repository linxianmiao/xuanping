import { observable, action, runInAction, toJS } from 'mobx'

const options = [
//   { value: 'filterOrg', state: 0, label: i18n('global_switch_tip1', '依赖组织机构做分级管理，默认工单只在同一级处理，上级可以管理下级，下级可通过子流程上报工单给上级') },
  // { value: 'closeRange', state: 0, label: i18n('global_switch_tip2', '工单处理过程中只有最后阶段可关闭工单') },
  { value: 'commentRange', state: 0, label: i18n('global_switch_tip3', '允许模型未授权人员评论、查看工单') },
  { value: 'subTicketCount', state: 0, label: i18n('global_switch_tip4', '创建子流程后会计算当前工单所有子流程数并记录到标题') }
]

class ConfigStore {
  @observable states = options

  @observable archivedTicket = 0

  @observable archivedType = 0

  @observable delayTime = 1

  @observable endStatus = []

  @observable opinions = {} // 处理意见

  @observable createTicket = undefined // 创建工单入口

  @observable autoReceiveForRemoteTicket = 1

  @action onChangeStates (states) {
    this.states = states
  }

  @action onChangeCreate (createTicket) {
    this.createTicket = createTicket
  }

  @action setOptions (data) {
    this.opinions = data
  }

  @action onArchiveState (value) {
    this.archivedTicket = value
  }

  @action onArchiveType (value) {
    this.archivedType = value
  }

  @action onArchiveTime (value) {
    this.delayTime = value
  }

  @action onEndStatus (values) {
    this.endStatus = values
  }

  @action onUpdate (data, callback) {
    axios.post(API.update_system, data).then(res => {
      res && callback(res)
    })
  }

  @action getConfig (data) {
    axios.get(API.query_system, { params: data }).then(res => {
      // 好奇怪的写法
      if (res) {
        const states = toJS(this.states)
        const lists = res.list
        states.map(item => {
          lists.filter(child => {
            if (item.value === child.code) {
              item.state = child.state
            }
          })
        })
        const filter = _.filter(lists, o => { return o.code === 'archivedTicket' })
        const createTicket = _.find(lists, o => { return o.code === 'catalog' })
        const archived = filter.length ? filter[0] : {}
        const { state, value } = archived
        const remoteTicketconfig= lists.find(d=>d.code === 'autoReceiveForRemoteTicket') || {}
        runInAction(() => {
          this.states = states
          this.archivedTicket = state || 0
          this.createTicket = createTicket
          this.archivedType = value ? value.archivedType : 0
          this.delayTime = value ? value.delayTime : 1
          this.endStatus = value ? value.endStatus : []
          this.autoReceiveForRemoteTicket = remoteTicketconfig.state
          this.opinions = _.find(lists, o => { return o.code === 'opinions' }) || {}
        })
      }
    })
  }
  @action changeRemoteTicketAuto = (val) => {
    this.autoReceiveForRemoteTicket = val
  }
  @action distory () {
    this.states = options
    this.archivedTicket = 0
    this.archivedType = 0
    this.delayTime = 1
    this.endStatus = []
  }
}

export default ConfigStore
