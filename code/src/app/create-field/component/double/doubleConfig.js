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
    name: i18n('keep_double', '保留几位小数'),
    required: 0,
    code: 'precision',
    type: 'inputNumber',
    minLength: 0,
    maxLength: 10000
  }, {
    name: i18n('min_value', '最小值'),
    required: 0,
    code: 'doubleMin',
    type: 'inputNumber',
    minLength: 0
  }, {
    name: i18n('max_value', '最大值'),
    required: 0,
    code: 'doubleMax',
    type: 'inputNumber',
    minLength: 0
  }
]

export default [...CommonConfig, ...Config]
