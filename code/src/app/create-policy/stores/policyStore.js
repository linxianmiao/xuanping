import { action, runInAction, observable } from 'mobx'
import defaultActions from '../config/actions'
const policyActions = [{
  strategyType: 0,
  timeDifference: 0,
  timeDifferenceUnit: 'MINUTES',
  types: [],
  color: '#ec4e53',
  actions: defaultActions
}]
// 兼容老数据，如果没有restful类型，增加restful类型
const addRestful = res => {
  if (!_.isEmpty(res.actions)) {
    res.actions.forEach(item => {
      if (!_.isEmpty(item.actions) && !item.actions.some(s => s.type === 'restful')) {
        item.actions.push(defaultActions.find(d => d.type === 'restful'))
      }
    })
  }
}
class Policy {
    @observable loading = false

    @observable.ref policy = {}

    @observable actions = policyActions

    @action async getPolicy (id) {
      const res = await axios.get(API.get_strategy_policy, { params: { id } }) || {}
      runInAction(() => {
        addRestful(res)
        this.policy = res
        this.actions = _.isEmpty(res.actions) ? policyActions : res.actions // 老数据有一些垃圾要处理下
      })
      return res
    }

    @action async updatePolicy (data) {
      const res = await axios.post(API.update_strategy, data)
      return res
    }

    @action async createPolicy (data) {
      const res = await axios.post(API.create_strategy, data)
      return res
    }

    @action distory () {
      this.loading = false
      this.policy = {}
      this.actions = policyActions
    }
}
export default new Policy()
