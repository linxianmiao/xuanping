import CommonConfig from '../../config/commonConfig'

const Config = [
  {
    name: i18n('field_excel', 'Excel 模板'),
    required: 1,
    code: 'excelColumn',
    type: 'excelImport'
  }
]

export default [...CommonConfig, ...Config]
