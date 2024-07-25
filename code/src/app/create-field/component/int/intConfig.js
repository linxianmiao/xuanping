import CommonConfig from '../../config/commonConfig'

const Config = [
  {
    name: i18n('default_value', '默认值'),
    required: 0,
    code: 'defaultValue',
    type: 'inputNumber',
    minLength: 0
  }, {
    name: i18n('unit', '单位'),
    required: 0,
    code: 'unit',
    type: 'input',
    style: { width: 80 }
  }, {
    name: i18n('min_value', '最小值'),
    required: 0,
    code: 'intMin',
    type: 'inputNumber',
    minLength: 0
  }, {
    name: i18n('max_value', '最大值'),
    required: 0,
    code: 'intMax',
    type: 'inputNumber',
    minLength: 0
  }
]

export default [...CommonConfig, ...Config]
