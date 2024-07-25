import { observable, action, runInAction } from 'mobx'

export default class TicketFieldJobStore {
  @observable.ref jobIds = []

  @observable.ref jobList = []

  // 查询作业计划
  @action.bound
  async job_query(ticketId) {
    const res = (await axios.get(API.job_query, { params: { ticketId } })) || []
    runInAction(() => {
      this.jobIds = _.map(res, item => item.id)
      this.jobList = res
    })
    return res
  }

  // 关联作业计划
  @action.bound
  async job_relate(ticketId, subJobList) {
    // 如果是子流程需要参数传过来
    const jobList = subJobList || this.jobList

    const data = _.map(jobList, item =>
      _.pick(item, ['id', 'name', 'status', 'jobId', 'actionType'])
    )
    const res = await axios.post(API.job_relate(ticketId), { jobList: data })
    return res
  }

  // 删除作业计划
  // type 1:定时作业 2:执行计划
  // delWay 0 刷新删除  、1 删除按钮删除
  @action.bound
  async job_delete(ids, type, delWay, ticketId) {
    const res = await axios.get(API.job_delete, {
      params: { ids, type, ticketId, refreshTag: delWay }
    })
    runInAction(() => {
      const delIdList = ids.split(',')
      this.jobList = _.filter(this.jobList, item => !_.includes(delIdList, item.id))
    })
    return res
  }


  // 刷新
  @action.bound
  async refreshJobPlan( ticketId,jobId) {
    const res = await axios.get(API.refreshJobPlan, {
      params: { ticketId, jobId }
    })
    return res
  }

  @action.bound
  setValue(data, type) {
    this[type] = data
  }

  @action.bound
  distory() {}
}
