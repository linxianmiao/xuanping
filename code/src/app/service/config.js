export const BASE_PARAMS = [
  {
    type: 'singleRow',
    name: i18n('sloth.srvitems.requestor', '请求人'),
    code: 'requester',
    validation: 'string'
  },
  {
    type: 'singleRow',
    name: i18n('sloth.srvitems.email', '邮箱'),
    code: 'email',
    validation: 'email'
  },
  {
    type: 'singleRow',
    name: i18n('sloth.srvitems.telephone', '手机号码'),
    code: 'phone',
    validation: 'string'
  },
  {
    type: 'singleRow',
    name: i18n('sloth.srvitems.req_descriptrion', '请求描述'),
    code: 'content',
    validation: 'string'
  },
  {
    type: 'singleSel',
    name: i18n('sloth.srvitems.priority', '紧急程度'),
    code: 'priority',
    params: [{
      value: '1',
      label: i18n('globe.none', '极低')
    }, {
      value: '2',
      label: i18n('low', '低')
    }, {
      value: '3',
      label: i18n('globe.normal', '中')
    }, {
      value: '4',
      label: i18n('globe.high', '高')
    }, {
      value: '5',
      label: i18n('globe.urgent', '极高')
    }]
  },
  {
    type: 'double',
    name: i18n('sloth.srvitems.cost', '费用'),
    code: 'amount'
  },
  {
    type: 'int',
    name: i18n('sloth.srvitems.number', '数量'),
    code: 'number'
  }
]
