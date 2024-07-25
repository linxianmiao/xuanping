export default [{
  name: i18n('field_desc', '字段说明'),
  required: 0,
  code: 'fieldDesc',
  type: 'textarea',
  maxLength: 1000
}, {
  name: i18n('privacy', '隐私'),
  required: 0,
  code: 'privacy',
  type: 'radio',
  buttonStyle:false,
  defaultValue: 0,
  label: i18n('privacy_label', '仅工单经办人员可见'),
  help: true,
  options: [
    {
      value: 0,
      label: i18n('field_value_no_privacy', '无隐私设置')
    },
    {
      value: 1,
      label: i18n('field_value_excutorSee', '仅当前工单处理人可见')
    },
    {
      value: 2,
      label: i18n('privacy_helpTxt', '仅当前工单经办人员可见')
    }
  ]
},
]
