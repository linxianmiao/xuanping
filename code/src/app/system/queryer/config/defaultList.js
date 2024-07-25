export default [
  {
    name: i18n('ticket-list-table-th-executionGroup', '处理组'),
    code: 'executionGroup',
    type: 'group'
  },
  {
    name: i18n('ticket.list.filter.filterOrg', '创建人所在部门'),
    code: 'filterOrg',
    type: 'department'
  },
  {
    name: i18n('participant.deparment', '参与人所在部门'),
    code: 'participantsDepartIds',
    type: 'department'
  },
  {
    name: i18n('ticket-list-table-th-assignee', '处理人'),
    code: 'executor',
    type: 'user'
  },
  {
    name: i18n('ticket-list-table-th-creatorName', '创建人'),
    code: 'creator',
    type: 'user'
  },
  {
    name: i18n('ticket.list.source', '工单来源'),
    code: 'source',
    type: 'select',
    params: [
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
        label: i18n('globe.asset', '资产'),
        value: 'asset'
      },
      {
        label: i18n('globe.other', '其他'),
        value: 'other'
      }
    ]
  },
  {
    name: i18n('ticket-list-table-th-status', '工单状态'),
    code: 'status',
    type: 'select',
    params: [
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
  },
  {
    name: i18n('ticket.list.name3', '逾期状态'),
    code: 'overdue',
    type: 'select',
    params: [
      {
        label: i18n('ticket.list.overdueStatus_0', '未逾期'),
        value: 0
      },
      {
        label: i18n('ticket.list.overdueStatus_1', '已逾期'),
        value: 1
      },
      {
        label: i18n('ticket.list.overdueStatus_2', '逾期已恢复'),
        value: 2
      }
    ]
  },
  {
    name: i18n('ticket.list.creator_time', '创建时间'),
    code: 'create_time',
    type: 'dateTime'
  },
  {
    name: i18n('ticket.list.update_time', '更新时间'),
    code: 'update_time',
    type: 'dateTime'
  }
]
