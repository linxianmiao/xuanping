import CommonConfig from '../../config/commonConfig'

const Config = [
  {
    name: i18n('field_value_user_userAndGroupList', '人员范围'),
    required: 1,
    code: 'userAndGroupList',
    type: 'user',
    defaultValue: null,
    options: [],
    sortKey: 5
  }
]

export default [...CommonConfig, ...Config]
