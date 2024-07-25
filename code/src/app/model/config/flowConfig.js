import getUid from '../../utils/uuid'
import { randomWord, defaultTacheButton } from '../component/flow/utils'

const RECT = 'rect'
const RHOMB = 'rhomb'
const CIRCLE = 'circle'

const shapePanelDataSource = [
  {
    name: i18n('conf.model.proces.rengong', '人工'),
    icon: 'iconfont icon-rengongjiedian',
    shape: RECT,
    node: {
      text: i18n('conf.model.proces.rengong1', '人工节点'),
      width: 100,
      height: 32,
      icon: '\uea24',
      activitiType: 'UserTask',
      counterSign: 0, // 侧边栏属性
      counterMultiSign: 0, // 侧边栏属性
      needApproval: 0,
      handlersRangeVo: {
        // 处理人范围
        scope: 0,
        directSelectionVo: {},
        handlersRulesVos: []
      },
      relateModels: [],
      tacheButton: defaultTacheButton()
    }
  },
  {
    name: i18n('conf.model.proces.approval', '审批'),
    icon: 'iconfont icon-filedone',
    shape: RECT,
    node: {
      text: i18n('conf.model.proces.ApprovalNode', '审批节点'),
      width: 100,
      height: 32,
      icon: '\ue7db',
      activitiType: 'ApprovalTask',
      counterSign: 0, // 侧边栏属性
      counterMultiSign: 0, // 侧边栏属性
      needApproval: 0,
      handlersRangeVo: {
        // 处理人范围
        scope: 0,
        directSelectionVo: {},
        handlersRulesVos: []
      },
      relateModels: [],
      tacheButton: defaultTacheButton(0, 0, 'ApprovalTask')
    }
  },

  // {
  //   name: i18n('conf.model.proces.approval', '审批'),
  //   icon: 'iconfont icon-rengongjiedian',
  //   shape: RECT,
  //   node: {
  //     text: i18n('conf.model.proces.approval', '审批'),
  //     width: 100,
  //     height: 32,
  //     icon: '\uea24',
  //     activitiType: 'Audit',
  //     counterSign: 0, // 侧边栏属性
  //     counterMultiSign: 0, // 侧边栏属性
  //     needApproval: 0,
  //     handlersRangeVo: {
  //       // 处理人范围
  //       scope: 0,
  //       directSelectionVo: {},
  //       handlersRulesVos: []
  //     },
  //     relateModels: [],
  //     tacheButton: defaultTacheButton()
  //   }
  // },
  {
    name: i18n('conf.model.proces.automatic', '自动'),
    icon: 'iconfont icon-zidongjiedian',
    shape: RECT,
    node: {
      text: i18n('conf.model.proces.automatic.node', '自动节点'),
      width: 100,
      height: 32,
      icon: '\uea27',
      activitiType: 'AutoTask',
      executeType: 0,
      dealRules: [
        {
          name: 'w',
          ruleType: 2,
          type: 4,
          autoType: 0,
          executionStrategy: 0,
          sensitiveAuthor: { all: [], users: [], groups: [] },
          executionTime: { selectType: 'value' }
        }
      ]
    }
  },
  {
    name: i18n('conf.model.proces.subprocess', '子流程'),
    icon: 'iconfont icon-icon-ziliucheng',
    shape: RECT,
    node: {
      text: i18n('conf.model.proces.subprocess', '子流程'),
      width: 100,
      height: 32,
      icon: '\uea23',
      activitiType: 'SubProcess',
      dealRules: [
        {
          type: 2,
          ruleType: 1,
          childMode: 0,
          childModel: { id: '', needSuspend: 0 },
          autoCreateTicket: 0,
          isWriteback: '0',
          name: 'auto'
        }
      ]
    }
  },
  {
    name: i18n('conf.model.proces.remote.request', '远程请求'),
    icon: 'iconfont icon-yuanchengguanli',
    shape: RECT,
    node: {
      text: i18n('conf.model.proces.remote.request', '远程请求'),
      width: 100,
      height: 32,
      icon: '\ue79c',
      activitiType: 'RemoteRequest',
      activityCrossVo: {
        targetSystemId: '',
        targetSystemName: '',
        targetModel: '',
        targetModelName: '',
        targetActivity: '',
        targetActivityName: '',
        backfill: false
      },
      handlersRangeVo: {
        // 处理人范围
        scope: 0,
        directSelectionVo: {},
        handlersRulesVos: []
      }
    }
  },
  {
    name: i18n('conf.model.proces.judgment', '判断'),
    shape: RHOMB,
    width: 40,
    height: 40,
    icon: 'iconfont icon-panding',
    node: {
      text: i18n('conf.model.proces.judgment.node', '判断节点'),
      width: 60,
      height: 40,
      icon: '\uea25',
      activitiType: 'ExclusiveGateway',
      isDefault: 0
    }
  },
  {
    name: i18n('conf.model.proces.synchronize', '同步'),
    icon: 'iconfont icon-tongbujiedian',
    shape: RHOMB,
    node: [
      {
        text: i18n('conf.model.proces.synchronize.start', '同步开始'),
        width: 60,
        height: 40,
        icon: '\ue88e',
        shape: RHOMB,
        activitiType: 'ParallelGateway',
        parallelGateType: 'start',
        x: 0,
        y: 0
      },
      {
        text: i18n('conf.model.proces.synchronize.end', '同步结束'),
        width: 60,
        height: 40,
        shape: RHOMB,
        icon: '\ue88e',
        activitiType: 'ParallelGateway',
        parallelGateType: 'end',
        x: 300,
        y: 0
      }
    ]
  },
  {
    name: i18n('conf.model.proces.inclusive', '包容'),
    shape: RHOMB,
    width: 40,
    height: 40,
    icon: 'iconfont icon-binghang',
    node: {
      text: i18n('conf.model.proces.Inclusive.node', '包容节点'),
      width: 60,
      height: 40,
      icon: '\uea22',
      activitiType: 'InclusiveGateway'
    }
  },
  {
    name: i18n('conf.model.proces.TimingTask', '定时器'),
    icon: 'iconfont icon-time-circle',
    shape: RECT,
    node: {
      text: i18n('conf.model.proces.TimingTask', '定时器'),
      width: 100,
      height: 32,
      icon: '\ue791',
      activitiType: 'TimingTask',
      timingStrategy: {
        executionType: '0'
      }
    }
  }
]

const shapePanelDataSource1 = {
  TimingTask: {
    name: i18n('conf.model.proces.TimingTask', '定时器'),
    icon: 'iconfont icon-time-circle',
    shape: RECT,
    node: {
      text: i18n('conf.model.proces.TimingTask', '定时器'),
      width: 100,
      height: 32,
      icon: '\ue791',
      activitiType: 'TimingTask',
      timingStrategy: {
        executionType: '0'
      }
    }
  },
  AutomaticDelivery: {
    name: i18n('conf.model.proces.AutomaticDelivery', '自动交付'),
    icon: 'iconfont icon-filesync',
    shape: RECT,
    node: {
      text: i18n('conf.model.proces.AutomaticDelivery', '自动交付'),
      width: 100,
      height: 32,
      icon: '\ue7de',
      activitiType: 'AutomaticDelivery',
      autoExecutionType: '0',
      handlersRangeVo: {
        // 处理人范围
        scope: 0,
        directSelectionVo: {},
        handlersRulesVos: []
      }
    }
  },
  ApprovalTask: {
    name: i18n('conf.model.proces.approval', '审批'),
    icon: 'iconfont icon-filedone',
    shape: RECT,
    node: {
      text: i18n('conf.model.proces.ApprovalNode', '审批节点'),
      width: 100,
      height: 32,
      icon: '\ue7db',
      activitiType: 'ApprovalTask',
      counterSign: 0, // 侧边栏属性
      counterMultiSign: 0, // 侧边栏属性
      needApproval: 0,
      handlersRangeVo: {
        // 处理人范围
        scope: 0,
        directSelectionVo: {},
        handlersRulesVos: []
      },
      relateModels: [],
      tacheButton: defaultTacheButton(0, 0, 'ApprovalTask')
    }
  },
  RemoteRequest: {
    name: i18n('conf.model.proces.remote.request', '远程请求'),
    icon: 'iconfont icon-yuanchengguanli',
    shape: RECT,
    node: {
      text: i18n('conf.model.proces.remote.request', '远程请求'),
      width: 100,
      height: 32,
      icon: '\ue79c',
      activitiType: 'RemoteRequest',
      activityCrossVo: {
        targetSystemId: '',
        targetSystemName: '',
        targetModel: '',
        targetModelName: '',
        targetActivity: '',
        targetActivityName: '',
        backfill: false
      },
      handlersRangeVo: {
        // 处理人范围
        scope: 0,
        directSelectionVo: {},
        handlersRulesVos: []
      }
    }
  }
}

export default {
  shapePanelDataSource,
  nodes: [
    {
      text: i18n('conf.model.proces.start', '开始'),
      width: 40,
      height: 40,
      shape: CIRCLE,
      activitiType: 'StartNoneEvent',
      activityCode: randomWord(),
      id: getUid(),
      x: 200,
      y: 200
    },
    {
      text: i18n('conf.model.proces.end', '结束'),
      width: 40,
      height: 40,
      shape: CIRCLE,
      activitiType: 'EndNoneEvent',
      activityCode: randomWord(),
      id: getUid(),
      x: 600,
      y: 200
    }
  ]
}
