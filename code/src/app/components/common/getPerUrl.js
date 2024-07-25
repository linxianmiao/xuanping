// 对侧边栏的权限数据进行处理
export const getPerUrl = function (item) {
  switch (item) {
    case 'overview':
      return '/ticket/pandect/default'
    case 'mytodo':
      return '/ticket/myToDo'
    case 'entrustTodo':
      return '/ticket/entrust'
    case 'myfollow':
      return '/ticket/myFollow'
    case 'mypartin':
      return '/ticket/myPartIn'
    case 'all_ticket':
      return '/ticket/all'
    case 'draft_box':
      return '/ticket/draftsList'
    case 'model_management':
      return '/conf/model'
    case 'field_management':
      return '/conf/field'
    case 'trigger':
    case 'trigger_management':
      return '/conf/trigger'
    case 'sla_management':
      return '/conf/sla/policy'
    case 'setting_management':
      return '/sysCon/global'
    case 'batchMyTodo':
      return '/ticket/batchTicket/batchMyTodo' // 批量处理
    default:
      return `/ticket/${item}`
  }
}
// 对侧边栏的权限数据进行处理
export const getCode = function (item = '') {
  switch (item) {
    case '/ticket/pandect/default':
      return 'overview'
    case '/ticket/myToDo':
      return 'mytodo'
    case '/ticket/entrust':
      return 'entrustTodo'
    case '/ticket/myFollow':
      return 'myfollow'
    case '/ticket/myPartIn':
      return 'mypartin'
    case '/ticket/all':
      return 'all_ticket'
    case '/ticket/draftsList':
      return 'draft_box'
    case '/conf/model':
      return 'model'
    case '/conf/formManagement':
      return 'formSet'
    case '/conf/field':
      return 'field'
    case '/conf/trigger':
      return 'trigger'
    case '/conf/sla/policy':
      return 'sla'
    case '/authority':
      return 'authority'
    case '/remote':
      return 'remoteList'
    default:
      const isSetting = item.indexOf('/sysCon/') > -1
      const arr = item.split('/')
      return isSetting ? 'sysCon' : arr[2]
  }
}
