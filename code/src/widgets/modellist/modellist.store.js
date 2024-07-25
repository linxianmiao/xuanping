import { inject } from '@uyun/core'
import { observable, action, runInAction } from 'mobx'

export class ModellistStore {
  // api 是在 ./modellist/widget.js 中 `providers` 配置的
  @inject('api') api

  // @observable models = [{"processId":"3c07e082614d44c3aaa48663e9cd497e","processName":"事件工单","num":0,"iconName":"incident","fileId":null,"layoutId":"ce6b69e089594e7e83f5aa190e732368","flowNoRule":null,"description":"事件工单流程","fileName":null,"externalURL":null,"sharedBusinessUnitName":null,"isCollect":1,"userManagers":null},{"processId":"452dae6a9ef7446f90140345e1970677","processName":"变更工单","num":0,"iconName":"alter","fileId":null,"layoutId":"ce6b69e089594e7e83f5aa190e732368","flowNoRule":null,"description":"变更工单流程","fileName":null,"externalURL":null,"sharedBusinessUnitName":null,"isCollect":0,"userManagers":null},{"processId":"610c49a534f64bc08bad5a264a4c1185","processName":"服务请求","num":0,"iconName":"fuwumulu","fileId":null,"layoutId":"ce6b69e089594e7e83f5aa190e732368","flowNoRule":null,"description":"服务请求","fileName":null,"externalURL":null,"sharedBusinessUnitName":null,"isCollect":0,"userManagers":null},{"processId":"ddaefe1390c64802abbfc0c07618b763","processName":"设备上下架","num":0,"iconName":"alter","fileId":null,"layoutId":"ce6b69e089594e7e83f5aa190e732368","flowNoRule":null,"description":"设备上下架流程，负责机房设备的上下架操作","fileName":null,"externalURL":null,"sharedBusinessUnitName":null,"isCollect":1,"userManagers":null},{"processId":"f5ad41ecc51f4ee7aa26767dd148cd74","processName":"资源申请","num":0,"iconName":"alter","fileId":null,"layoutId":"ce6b69e089594e7e83f5aa190e732368","flowNoRule":null,"description":"资源申请流程，用于各种资源的申请","fileName":null,"externalURL":null,"sharedBusinessUnitName":null,"isCollect":1,"userManagers":null},{"processId":"f92535d448774ec0a692a2b7d19fd153","processName":"qsb测试子流程","num":0,"iconName":"alter","fileId":null,"layoutId":"ce6b69e089594e7e83f5aa190e732368","flowNoRule":null,"description":"","fileName":null,"externalURL":null,"sharedBusinessUnitName":null,"isCollect":1,"userManagers":[{"id":"09aac9d78fe64002b16346522b27f6a5","type":"user","seq":0,"name":"杭州研发部-itsm用户51","code":null},{"id":"1256435873544bff973fc60d774a876e","type":"user","seq":0,"name":"yuli123","code":null}]},{"processId":"4550cf5d379b4c148a43176a45d071b0","processName":"qsb测试","num":0,"iconName":"alter","fileId":null,"layoutId":"3991d238d79e4aeb814133744c023616","flowNoRule":null,"description":"","fileName":null,"externalURL":null,"sharedBusinessUnitName":null,"isCollect":1,"userManagers":[{"id":"e10adc3949ba59abbe56e057f20f88dd","type":"user","seq":0,"name":"admin","code":null},{"id":"f7a3a8cf514e44cf87ace607fe23d091","type":"user","seq":0,"name":"马倩倩","code":null}]},{"processId":"9a1a06c56a2c494cbfe3c7705eca65ca","processName":"动态同步冒烟","num":0,"iconName":"alter","fileId":null,"layoutId":"ce6b69e089594e7e83f5aa190e732368","flowNoRule":null,"description":"","fileName":null,"externalURL":null,"sharedBusinessUnitName":null,"isCollect":0,"userManagers":null},{"processId":"7999239253144cb28f4a12d77ceb1525","processName":"xzy测试模型","num":0,"iconName":"alter","fileId":null,"layoutId":"ce6b69e089594e7e83f5aa190e732368","flowNoRule":null,"description":"","fileName":null,"externalURL":null,"sharedBusinessUnitName":null,"isCollect":1,"userManagers":null}]
  @observable models = []

  @observable loading = false

  @action.bound
  async getModels(params) {
    const res = await this.api.queryModels(params) || {}
    const models = res.list || []

    runInAction(() => {
      this.models = models
    })
  }

  @action.bound
  async getSelectedModels() {
    this.loading = true

    const res = await this.api.querySelectedModels() || []

    runInAction(() => {
      this.models = res
      this.loading = false
    })
  }
}
