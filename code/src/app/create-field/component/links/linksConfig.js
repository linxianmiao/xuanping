import CommonConfig from '../../config/commonConfig'

const Config = [{
  name: i18n('field_links_name', '链接名称'),
  required: 0,
  code: 'linkName',
  type: 'input',
  minLength: 0,
  maxLength: 32,
  allowEdit: true
}, {
  name: i18n('field_links_url', '链接地址'),
  required: 0,
  code: 'linkUrl',
  type: 'linkUrl',
  allowEdit: true
}]

export default [...CommonConfig, ...Config]
