import { observable, action, runInAction, reaction } from 'mobx'
import setProps from '~/utils/setProps'

const defaultConditions = {
  pageNum: 1,
  pageSize: 15,
  queryContent: undefined,
  creator: [],
  createTimes: [],
  executor: [],
  executionGroup: [],
  status: [],
  modelIds: [],
  activityIds: [],
  highlighterPreTag: '<span class="search-result-highlight">',
  highlighterPostTag: '</span>',
  sort: '_score' // 排序。 _score:按匹配度，createTime:按时间
}

class SearchStore {
  // 历史关键字
  @observable historyKeywords = []

  @observable data = []

  @observable total = 0

  // 筛选条件
  @observable conditions = { ...defaultConditions }

  @observable loading = false

  // 是否已经搜索过，用户判断空数据显示 空/搜索无结果
  @observable isSearched = false

  reaction = reaction(
    () => [this.conditions],
    () => {
      // 如果筛选条件全部清空，则重置
      const {
        queryContent,
        creator,
        createTimes,
        executor,
        executionGroup,
        status,
        modelIds,
        activityIds
      } = this.conditions
      if (
        !!queryContent ||
        creator.length > 0 ||
        createTimes.length > 0 ||
        executor.length > 0 ||
        executionGroup.length > 0 ||
        status.length > 0 ||
        modelIds.length > 0 ||
        activityIds.length > 0
      ) {
        this.query()
      } else {
        this.reset()
      }
    }
  )

  @action setProps = setProps(this)

  @action.bound
  setConditions(conditions) {
    this.conditions = conditions
  }

  @action
  async query() {
    this.loading = true

    const res = await axios.post(API.queryTicketGlobal, this.conditions)
    const { total, list } = res || {}

    runInAction(() => {
      this.data = list || []
      this.total = total || 0
      this.loading = false
      this.isSearched = true

      const { queryContent } = this.conditions

      if (queryContent && !this.historyKeywords.includes(queryContent)) {
        // 当前的搜索关键字不在历史搜索关键字中，重新查询历史关键字
        this.queryHistoryKeywords()
      }
    })
  }

  @action
  async queryHistoryKeywords() {
    const res = await axios.get(API.queryTicketGlobalHistory)

    runInAction(() => {
      this.historyKeywords = res || []
    })
  }

  @action
  reset() {
    this.data = []
    this.total = 0
    this.loading = false
    this.isSearched = false
  }
}

export default new SearchStore()