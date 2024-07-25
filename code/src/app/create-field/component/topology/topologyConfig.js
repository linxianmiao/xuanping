import CommonConfig from '../../config/commonConfig'

const Config = [{
  name: i18n('chartType', '图形类型'),
  code: 'chartType',
  type: 'select',
  required: 1,
  defaultValue: undefined,
  params: [{
    value: '0',
    label: i18n('chartType-value-0', '部署架构图')
  }, {
    value: '1',
    label: i18n('chartType-value-1', '部署实例图')
  }, {
    value: '2',
    label: i18n('chartType-value-2', '自由拓扑图')
  }]
}]

export default [...CommonConfig, ...Config]
