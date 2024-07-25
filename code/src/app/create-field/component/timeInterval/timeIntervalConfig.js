import CommonConfig from '../../config/commonConfig'

const Config = [
  {
    name: i18n('timeInterval-timeRule', '时间格式'),
    required: 0,
    code: 'timeRule',
    type: 'radioButton',
    defaultValue: '0',
    options: [
      { label: i18n('timeInterval-timeRule-0', '时/分'), value: '0' },
      { label: i18n('timeInterval-timeRule-1', '天/时/分'), value: '1' }
    ]
  },
  {
    name: i18n('default_value', '默认值'),
    required: 0,
    code: 'defaultValue',
    type: 'timeInterval',
    defaultValue: {
      date: undefined,
      hour: undefined,
      minute: undefined
    }
  }
]

export default [...CommonConfig, ...Config]
