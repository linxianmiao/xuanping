// 优先级数据
const priority = [
  {
    label: i18n('globe.urgent', '极高'),
    value: '5'
  },
  {
    label: i18n('globe.high', '高'),
    value: '4'
  },
  {
    label: i18n('globe.normal', '中'),
    value: '3'
  },
  {
    label: i18n('globe.low', '低'),
    value: '2'
  },
  {
    label: i18n('globe.none', '极低'),
    value: '1'
  }
]
// 工单来源列表
const ticketSource = [
  {
    label: i18n('globe.itsm', 'ITSM'),
    value: 'itsm'
  },
  {
    label: i18n('globe.wechat', '微信'),
    value: 'wechat'
  },
  {
    label: i18n('globe.import', '工单导入'),
    value: 'import'
  },
  {
    label: i18n('globe.alert', '告警'),
    value: 'alert'
  },
  {
    label: i18n('globe.chatops', 'ChatOps'),
    value: 'chatops'
  },
  {
    label: i18n('globe.cmdb', 'CMDB'),
    value: 'cmdb'
  },
  {
    label: i18n('globe.catalog', '服务请求'),
    value: 'catalog'
  },
  {
    label: i18n('globe.other', '其他'),
    value: 'other'
  }
]
// 工单状态列表
const ticketStatus = [
  {
    label: i18n('ticket.list.status_1', '待处理'),
    value: '1'
  },
  {
    label: i18n('ticket.list.status_2', '处理中'),
    value: '2'
  },
  {
    label: i18n('ticket.list.status_3', '已完成'),
    value: '3'
  },
  {
    label: i18n('ticket.list.status_7', '已关闭'),
    value: '7'
  },
  {
    label: i18n('ticket.list.status_10', '挂起'),
    value: '10'
  },
  {
    label: i18n('ticket.list.status_11', '已废除'),
    value: '11'
  }
]
// 默认展示的筛选列表
const screenList = [
  {
    label: i18n('ticket.list.ticketName', '标题'),
    value: 'ticketName',
    type: 'singleRowText'
  },
  {
    label: i18n('ticket.list.ticketNum', '单号'),
    value: 'ticketNum',
    type: 'singleRowText'
  },
  {
    label: i18n('ticket.list.screen.executor', '当前处理人'),
    value: 'executor',
    type: 'user'
  },
  {
    label: i18n('ticket.list.requester', '创建人'),
    value: 'creator',
    type: 'user'
  },
  {
    label: i18n('ticket.list.priority', '优先级'),
    value: 'priority',
    type: 'multiSel',
    params: priority
  },
  {
    label: i18n('ticket.list.source', '工单来源'),
    value: 'source',
    type: 'multiSel',
    params: ticketStatus
  },
  {
    label: i18n('ticket.list.status', '工单状态'),
    value: 'status',
    type: 'multiSel',
    params: ticketSource
  },
  {
    label: i18n('ticket.list.overdue', '逾期状态'),
    value: 'overdue',
    type: 'listSel',
    params: [
      {
        value: '1',
        label: i18n('ticket.list.overdue.status1', '已逾期')
      },
      {
        value: '0',
        label: i18n('ticket.list.overdue.status0', '未逾期')
      }
    ]
  },
  {
    label: i18n('ticket.list.create_time', '创建时间'),
    type: 'time',
    value: 'create_time'
  },
  {
    label: i18n('ticket.list.update_time', '更新时间'),
    type: 'tiem',
    value: 'update_time'
  }
]

export { screenList }
