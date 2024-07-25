// 工单
// 由于部件里获取不到i8n故需要判断有无i8n没有就需要传进来
function list(i18n) {
  const tickets = [
    {
      value: 'myToDo',
      name: i18n('layout.myTodo', '个人待办'),
      path: '/ticket/myToDo'
    },
    {
      value: 'entrust',
      name: i18n('layout.entrust', '委托待办'),
      path: '/ticket/entrust'
    },
    {
      value: 'mycheck',
      name: '我的待阅',
      path: '/ticket/mycheck'
    },
    {
      value: 'myFollow',
      name: i18n('layout.following', '我的关注'),
      path: '/ticket/myFollow'
    },
    {
      value: 'myPartIn',
      name: i18n('layout.my_Tickets', '我参与的'),
      path: '/ticket/myPartIn'
    },
    {
      value: 'archived',
      name: '归档工单',
      path: '/ticket/archived'
    },
    {
      value: 'all',
      name: i18n('layout.All_Tickets', '所有工单'),
      path: '/ticket/all'
    },
    {
      value: 'draftsList',
      name: i18n('layout.draft', '草稿箱'),
      path: '/ticket/draftsList'
    },
    {
      value: 'detail',
      name: i18n('layout.detail', '详情'),
      path: '/ticket/myToDo'
    },
    {
      value: 'pandect',
      name: i18n('globe.overview', '总览'),
      path: '/ticket/pandect'
    },
    {
      value: 'createTicket',
      name: i18n('ticket.create.create_ticket', '创建工单'),
      path: '/ticket/myToDo'
    },
    {
      value: 'drafts',
      name: '草稿'
    },
    {
      value: 'createService',
      name: i18n('ticket.create.create_server', '创建服务'),
      path: '/ticket/myToDo'
    },
    {
      value: 'batchTicket',
      name: i18n('batch-process', '批量处理'),
      path: '/ticket/batchTicket'
    }
  ]

  const confs = [
    {
      value: 'model',
      name: i18n('layout.model', '模型管理'),
      path: '/conf/model'
    },
    {
      value: 'approval',
      name: i18n('layout.modelAppraval', '审批记录'),
      path: '/conf/model'
    },
    {
      value: 'advancedCreate',
      name: i18n('new_model', '新建模型'),
      path: '/conf/model'
    },
    {
      value: 'advanced',
      name: i18n('edit-model', '编辑模型'),
      path: '/conf/model'
    },
    {
      value: 'field',
      name: i18n('layout.fields', '字段管理'),
      path: '/conf/field'
    },
    {
      value: 'trigger',
      name: i18n('layout.triggers', '触发器'),
      path: '/conf/trigger'
    },
    {
      value: 'policy',
      name: i18n('layout.sla_manage', 'SLA管理'),
      path: '/conf/sla/policy'
    },
    {
      value: 'definition',
      name: i18n('layout.sla_manage', 'SLA管理'),
      path: '/conf/sla/definition'
    },
    {
      value: 'slaStatistics',
      name: i18n('layout.sla_manage', 'SLA管理'),
      path: '/conf/sla/slaStatistics'
    },
    {
      value: 'olaStatistics',
      name: i18n('layout.sla_manage', 'SLA管理'),
      path: '/conf/sla/olaStatistics'
    },
    {
      value: 'triggerRecord',
      name: i18n('layout.record', '查看记录'),
      path: '/conf/trigger'
    },
    {
      value: 'policyRecord',
      name: i18n('layout.record', '查看记录'),
      path: '/conf/sla'
    },
    {
      value: 'formManagement',
      name: i18n('layout.formSet', '子表单管理'),
      path: '/conf/subForm'
    },
    {
      value: 'update',
      name: i18n('edit', '编辑')
    },
    {
      value: 'database',
      name: '数据表管理',
      path: '/conf/database'
    },
    {
      value: 'edit',
      name: '编辑数据表',
      path: '/conf/database'
    }
  ]

  const sysCons = [
    {
      value: 'users',
      name: i18n('user_group', '用户组'),
      path: '/sysCon/users'
    },
    {
      value: 'global',
      name: i18n('layout.sysCon', '设置'),
      path: '/sysCon/global'
    },
    {
      value: 'matrix',
      name: i18n('global_matrix', '协同矩阵'),
      path: '/sysCon/matrix'
    },
    {
      value: 'matrixTemplate',
      name: i18n('global_matrix', '协同矩阵'),
      path: '/sysCon/matrix'
    },
    {
      value: 'copy',
      name: i18n('copy', '复制'),
      path: '/sysCon/matrixTemplate'
    },
    {
      value: 'queryer',
      name: i18n('global_queryer', '查询器'),
      path: '/sysCon/queryer'
    },
    {
      value: 'directory',
      name: i18n('global_change_directory', '变更目录'),
      path: '/sysCon/directory'
    },
    {
      value: 'nodename',
      name: i18n('node_name_management', '节点名称管理'),
      path: '/sysCon/nodename'
    },
    {
      value: 'create',
      name: i18n('layout.new', '新建'),
      path: '/sysCon/matrix'
    },
    {
      value: 'dictionary',
      name: i18n('global_dictionary_manage'),
      path: 'sysCon/dictionary'
    },
    {
      value: 'appAccess',
      name: i18n('app.access', '应用接入'),
      path: '/sysCon/appAccess'
    },
    {
      value: 'verification',
      name: i18n('global_verification', '全局验证'),
      path: '/sysCon/verification'
    },
    {
      value: 'remoteSettings',
      name: i18n('remote_settings', '远程对接设置'),
      path: '/sysCon/remoteSettings'
    }
  ]

  const authority = [
    {
      value: 'authority',
      name: i18n('layout.authority', '权限'),
      path: '/authority'
    }
  ]
  const list = [...tickets, ...confs, ...sysCons, ...authority]
  return list
}

export default list
