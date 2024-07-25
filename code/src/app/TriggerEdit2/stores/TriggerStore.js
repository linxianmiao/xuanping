import { observable, action, runInAction } from 'mobx'
import { actionsInfo } from '../constant'

// 在服务端返回的数据的基础上，如果没有name，则使用默认name，再加个fields属性
function parseActionTypes(data) {
  const newData = data || []
  return newData.map(item => {
    const action = actionsInfo.find(i => i.type === item.type)
    if (!action) {
      return item
    }
    item.name = item.name || action.name
    item.fields = action.fields
    return item
  })
}

// 定时策略数据格式
const getInitialTimeStrategyVo = () => ({
  executeDayOfMonth: undefined,  // 某月的日
  executeDayOfWeek: undefined,   // 周几
  executeMonth: undefined, // 月份
  executeTime: undefined,  // 时间
  executeType: '1', // 重复类型
  intervalUnit: '1', // 周期单位
  timeInterval: 0 // 周期
})

// 触发器数据格式
const getInitialTrigger = () => ({
  id: '',
  name: undefined,
  description: undefined,
  triggerType: '1',
  incident: undefined,
  triggerConditions: {
    conditionExpressions: [],
    nestingConditions: [],
    when: "any"
  },
  timeStrategyVo: getInitialTimeStrategyVo(),
  actionList: [],
  delay: 0, // 触发时机
  delayTime: 0,
  delayUnit: 'HOURS'
})

class Trigger {
  @observable trigger = getInitialTrigger()

  // 动作，包括事件动作和时间动作
  @observable actions = {}

  @observable.ref fieldParams = {
    builtinParams: [],
    defineParams: [],
    fullParams: [],
    ticketParams: [],
    titleParams: []
  }

  // 创建工单动作中的可选模型
  @observable models = []

  // 创建工单动作下的表单ref
  @observable createTicketFormRefs = []

  // 是否正在提交，用于校验数据
  @observable isSubmitting = false

  // 测试结果
  @observable testResult = []

  @action
  pushCreateTicketFormRef = ref => {
    this.createTicketFormRefs =[...this.createTicketFormRefs, ref]
  }

  @action
  quitCreateTicketFormRef = index => {
    this.createTicketFormRefs.splice(index, 1)
  }

  @action
  setTrigger = trigger => {
    this.trigger = trigger
  }

  @action
  setSubmitting = flag => {
    this.isSubmitting = flag
  }

  @action.bound async getTriggerById(id) {
    try {
      const res = await axios.get(API.getTriggerById(id)) || {}
      runInAction(() => {
        this.trigger = res
      })
      return res
    } catch (error) {
      console.log(error)
    } finally {
    }
  }

  @action.bound
  testTrigger = async trigger => {
    const res = await axios.post(API.testTrigger, trigger) || []
    
    runInAction(() => {
      this.testResult = res
    })
  }

  @action
  getActionsByType = async type => {
    const res = await axios.get(API.getActionListByType(type)) || []
    
    runInAction(() => {
      const newActions = parseActionTypes(res)
      this.actions = { ...this.actions, [type]: newActions }
    })
  }

  @action.bound
  getFieldParamList = async () => {
    const res = await axios.get(API.get_field_params)
    runInAction(() => {
      this.fieldParams = res
    })
  }

  @action.bound
  getModelsByUser = async () => {
    const res = await axios.get(API.default_get_module)

    runInAction(() => {
      this.models = res || []
    })
  }

  @action
  destory = () => {
    this.trigger = getInitialTrigger()
    this.actions = {}
    this.models = []
    this.createTicketFormRefs = []
    this.isSubmitting = false
  }
}

export default Trigger
