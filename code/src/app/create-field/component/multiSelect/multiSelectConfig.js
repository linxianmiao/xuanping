import CommonConfig from '../../config/commonConfig'

const Config = [
  {
    name: i18n('value_range', '值范围'),
    required: 1,
    code: 'params',
    type: 'params',
    defaultValue: [{ select: 0, value: '', label: '' }]
  }
]

export default [...CommonConfig, ...Config]
