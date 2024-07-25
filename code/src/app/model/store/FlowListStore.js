import { action, runInAction, observable } from 'mobx'
import TableStore from '~/stores/TableStore'

export default class FlowListStore extends TableStore {
  @observable
  chartId = ''

  @observable
  chartType = 1

  queryFunc = params => axios.get(API.getProcessChartList, { params })

  // 创建子流程
  @action
  async createSubProcess(name, modelId) {
    const res = await axios.post(API.createSubProcessChartInfo(name, modelId))
    return res
  }

  // 复制子流程
  @action
  async copySubFlow(params) {
    const res = await axios.post(API.copy_sub_flow, { ...params })
    return res
  }

  // 验证子流程是否可以复制
  @action async validateCopySubprocess(data) {
    return new Promise(resolve => {
      axios.post(API.verify_sub_flow, { ...data }).then(res => {
        resolve(res)
      })
    })
  }

  // 更改状态
  @action
  async changeProcessStatus(params) {
    const { modelId, chartId, status } = params
    const res = await axios.post(API.changeProcessStatus(modelId, chartId, status))
    return res
  }

  // 编辑流程名称
  @action
  async editProcessName(chartId, name) {
    const res = await axios.post(API.editProcessName(chartId, name))
    return res
  }

  // 删除子流程
  @action
  async deleteProcess(modelId, chartId) {
    const res = await axios.post(API.deleteProcess(modelId, chartId))
    return res
  }

  @action
  getChartInfo(chartId = '', chartType = 1) {
    runInAction(() => {
      this.chartId = chartId
      this.chartType = chartType
    })
  }
}
