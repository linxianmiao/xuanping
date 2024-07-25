const TABS = {
  1: { type: 'user', name: i18n('filed.personne', '人员') },
  0: { type: 'group', name: i18n('user_group', '用户组') },
  2: { type: 'department', name: i18n('filed.department', '部门') },
  3: { type: 'role', name: i18n('ticket-user-role', '角色') },
  4: { type: 'rota', name: i18n('ticket-user-rota', '值班') },
  5: { type: 'variable', name: i18n('ticket-user-variable', '变量') }
}

const SELECTTYPE = {
  1: 'checkBox',
  0: 'checkBox',
  2: 'checkBox',
  3: 'checkBox',
  4: 'checkBox',
  5: 'checkBox'
}

const SELECTS = {
  1: [],
  0: [],
  2: [],
  3: [],
  4: [],
  5: []
}
export {
  TABS,
  SELECTTYPE,
  SELECTS
}
