// 对侧边栏的权限数据进行处理
export default function getPermissions(productPermissions) {
  const permissionList = _.map(productPermissions, (item) => {
    switch (item) {
      case 'overview':
        return 'pandect'
      case 'mytodo':
        return 'myToDo'
      case 'entrustTodo':
        return 'entrust'
      case 'myfollow':
        return 'myFollow'
      case 'mypartin':
        return 'myPartIn'
      case 'all_ticket':
        return 'all'
      case 'draft_box':
        return 'drafts'
      case 'model_management':
        return 'model'
      case 'field_management':
        return 'field'
      case 'trigger_management':
        return 'trigger'
      case 'sla_management':
        return 'sla'
      case 'setting_management':
        return 'sysCon'
      case 'form_management':
        return 'formSet'
      case 'permission_management':
        return 'authority'
      case 'datasheet_management':
        return 'database'
      default:
        return item
    }
  })

  return ['createTicket', ...permissionList]
}
