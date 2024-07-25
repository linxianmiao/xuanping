const actions = [
  {
    value: '${ticket.creator}',
    name: i18n('config.trigger.creator', '创建人')
  },
  {
    value: '${ticket.leader.0}',
    name: i18n('config.trigger.DepartmentHead', '创建者部门负责人'),
    sub: [
      {
        value: '${ticket.leader}',
        name: i18n('config.trigger.leader0', '本级部门负责人')
      },
      {
        value: '${ticket.leader.1}',
        name: i18n('config.trigger.leader1', '上1级部门负责人')
      },
      {
        value: '${ticket.leader.2}',
        name: i18n('config.trigger.leader2', '上2级部门负责人')
      },
      {
        value: '${ticket.leader.3}',
        name: i18n('config.trigger.leader3', '上3级部门负责人')
      },
      {
        value: '${ticket.leader.4}',
        name: i18n('config.trigger.leader4', '上4级部门负责人')
      },
      {
        value: '${ticket.leader.5}',
        name: i18n('config.trigger.leader5', '上5级部门负责人')
      },
      {
        value: '${ticket.leader.6}',
        name: i18n('config.trigger.leader6', '上6级部门负责人')
      },
      {
        value: '${ticket.leader.7}',
        name: i18n('config.trigger.leader7', '上7级部门负责人')
      },
      {
        value: '${ticket.leader.8}',
        name: i18n('config.trigger.leader8', '上8级部门负责人')
      },
      {
        value: '${ticket.leader.9}',
        name: i18n('config.trigger.leader9', '上9级部门负责人')
      },
      {
        value: '${ticket.leader.10}',
        name: i18n('config.trigger.leader10', '上10级部门负责人')
      }
    ]
  },
  {
    value: '${ticket.lastHandler.0}',
    name: i18n('config.trigger.assignee', '阶段处理人'),
    sub: [
      {
        value: '${ticket.lastHandler}',
        name: i18n('config.trigger.preHandler0', '上一阶段处理人')
      },
      {
        value: '${ticket.lastHandler.1}',
        name: i18n('config.trigger.preHandler1', '第1阶段处理人')
      },
      {
        value: '${ticket.lastHandler.2}',
        name: i18n('config.trigger.preHandler2', '第2阶段处理人')
      },
      {
        value: '${ticket.lastHandler.3}',
        name: i18n('config.trigger.preHandler3', '第3阶段处理人')
      },
      {
        value: '${ticket.lastHandler.4}',
        name: i18n('config.trigger.preHandler4', '第4阶段处理人')
      },
      {
        value: '${ticket.lastHandler.5}',
        name: i18n('config.trigger.preHandler5', '第5阶段处理人')
      },
      {
        value: '${ticket.lastHandler.6}',
        name: i18n('config.trigger.preHandler6', '第6阶段处理人')
      },
      {
        value: '${ticket.lastHandler.7}',
        name: i18n('config.trigger.preHandler7', '第7阶段处理人')
      },
      {
        value: '${ticket.lastHandler.8}',
        name: i18n('config.trigger.preHandler8', '第8阶段处理人')
      },
      {
        value: '${ticket.lastHandler.9}',
        name: i18n('config.trigger.preHandler9', '第9阶段处理人')
      },
      {
        value: '${ticket.lastHandler.10}',
        name: i18n('config.trigger.preHandler10', '第10阶段处理人')
      }
    ]
  }
]

export default actions
