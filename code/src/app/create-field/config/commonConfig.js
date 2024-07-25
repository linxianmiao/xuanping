const CommonConfig = [
  {
    name: i18n('field_name', '字段名称'),
    required: 1,
    code: 'name',
    type: 'input',
    minLength: 0,
    maxLength: 32,
    allowEdit: false,
    style: { width: 335 }
  },
  {
    name: i18n('field_group', '字段分组'),
    required: 1,
    code: 'layoutInfoVo',
    type: 'fieldLayouts',
    style: { width: 335 }
  },
  {
    name: i18n('field_value_code', '属性编码'),
    required: 1,
    code: 'code',
    type: 'input',
    minLength: 2,
    maxLength: 20,
    style: { width: 335 }
  }
]

export default CommonConfig
