import CommonConfig from '../../config/commonConfig'

const Config = [{
  name: i18n('action_type', '执行方式'),
  required: 0,
  code: 'executeWay',
  type: 'radioButton',
  allowEdit: true,
  defaultValue: '0',
  options: [
    { label: i18n('node.selected', '节点选择'), value: '0' },
    { label: i18n('group.execution', '分组执行'), value: '1' },
    { label: i18n('regulatory.agency', '监管代理'), value: '2' }
  ]
}]

export default [...CommonConfig, ...Config]
