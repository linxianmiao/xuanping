export default [{
  name: i18n('conf.model.field.card.name', '名称'),
  type: 'input',
  code: 'name',
  required: 1,
  minLength: 0,
  maxLength: 10

}, {
  name: i18n('conf.model.field.card.desc', '描述'),
  type: 'textarea',
  code: 'description',
  required: 0,
  minLength: 0,
  maxLength: 100
}]
