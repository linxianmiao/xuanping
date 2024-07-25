import CommonConfig from '../../config/commonConfig'

const Config = [
  {
    name: i18n('ticket-field-isSingle', '使用类型'),
    required: 0,
    code: 'isSingle',
    type: 'radioButton',
    defaultValue: '0',
    options: [{
      value: '0',
      label: i18n('normal.button', '常规按钮')
    }, {
      value: '1',
      label: i18n('radio.card', '选项卡')
    }]
  },
  {
    name: i18n('value_range', '值范围'),
    required: 1,
    code: 'params',
    type: 'params',
    defaultValue: [{ select: 0, value: '', label: '' }]
  }
]

export default [...CommonConfig, ...Config]
