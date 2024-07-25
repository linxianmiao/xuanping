export default {
  triggerType: [
    {
      code: 'start',
      name: i18n('trigger_type1', '任务启动时')
    },
    {
      code: 'mergedTicketEnd',
      name: '合并工单任务结束时'
    },
    {
      code: 'end',
      name: i18n('trigger_type2', '任务结束时')
    },
    {
      code: 'allend',
      name: i18n('trigger_type3', '全部结束时')
    },
    {
      code: 'reAssign',
      name: i18n('trigger_type4', '改派时')
    },
    {
      code: 'accept',
      name: i18n('trigger_type5', '接单时')
    },
    {
      code: 'reminder',
      name: i18n('trigger_type6', '催办时')
    }
  ],
  triggerClass: [
    {
      code: 'submit',
      name: i18n('globe.submit', '提交')
    },
    {
      code: 'jump',
      name: i18n('globe.jump', '跳转')
    },
    {
      code: 'rollback',
      name: i18n('globe.rollback', '回退')
    },
    {
      code: 'closed',
      name: i18n('globe.close', '关闭')
    },
    {
      code: 'delete',
      name: i18n('globe.abolish', '废除')
    }
  ]
}
