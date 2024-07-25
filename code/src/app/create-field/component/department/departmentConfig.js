import CommonConfig from '../../config/commonConfig'

const Config = [
  {
    name: i18n('field_value_user_isSingle', '选择类型'),
    required: 1,
    code: 'isSingle',
    type: 'radio',
    defaultValue: '0',
    options: [{
      value: '0',
      label: i18n('field_value_user_listSel', '单选')
    }, {
      value: '1',
      label: i18n('field_value_user_multiSelect', '多选')
    }]
  }, {
    name: i18n('default_department', '默认值'),
    required: 0,
    code: 'curr_depart',
    type: 'checkbox',
    defaultValue: false,
    label: i18n('default-current-department', '当前部门')
  }
]

export default [...CommonConfig, ...Config]
