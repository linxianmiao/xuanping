function validateIframe(iframeData) {
  const { name, linkUrl, height, viewEditVo, mode } = iframeData
  if (_.isEmpty(name) || !height) {
    return true
  }
  if (mode === 0 && _.isEmpty(linkUrl)) {
    return true
  }
  if (mode === 1) {
    const { viewUrl, editUrl } = viewEditVo
    if (_.isEmpty(viewUrl) || _.isEmpty(editUrl)) {
      return true
    }
  }
  return false
}
function validateSla(slaData) {
  const { name, height } = slaData
  if (_.isEmpty(name) || !height) {
    return true
  }
  return false
}
// iframe控件keys，后端会污染数据
const iframeKeys = [
  'id',
  'height',
  'linkUrl',
  'mode',
  'name',
  'type',
  'verificationWay',
  'viewEditVo',
  'styleAttribute',
  'ifPrivacy'
]
// sla控件keys
const slaKeys = ['id', 'height', 'name', 'type', 'styleAttribute']

const subFormKeys = ['id', 'name', 'type', 'relatedTemplateId', 'hidden', 'mode', 'relatedVariable']

const relateTicketKeys = ['id', 'height', 'name', 'type', 'styleAttribute', 'isRequired']

function getFields(formLayoutVos) {
  return new Promise((resolve, reject) => {
    let fields = []
    _.forEach(formLayoutVos, formLayout => {
      if (formLayout) {
        const { type, fieldList, tabs } = formLayout
        if (type === 'group') {
          fields = [...fields, ...fieldList]
        } else if (type === 'tab') {
          _.forEach(tabs, tab => {
            fields = [...fields, ...tab.fieldList]
          })
        } else if (type === 'iframe' && validateIframe(formLayout)) {
          reject(new Error('iframe'))
        } else if (type === 'sla' && validateSla(formLayout)) {
          reject(new Error('sla'))
        }
      }
    })

    const iframeList = _.filter(fields, field => field.type === 'iframe')
    const slaList = _.filter(fields, field => field.type === 'sla')

    if (_.some(iframeList, iframe => validateIframe(iframe))) {
      reject(new Error('iframe'))
    }
    if (_.some(slaList, sla => validateSla(sla))) {
      reject(new Error('sla'))
    }
    // 过滤掉不是字段的数据
    fields = _.filter(
      fields,
      field => !_.includes(['iframe', 'placeholder', 'sla', 'relateTicket'], field.type)
    )
    resolve(fields)
  })
}

export function getFormLayoutVos(formLayoutVos) {
  return _.map(formLayoutVos, formLayout => {
    const { type, fieldList, tabs } = formLayout

    if (type === 'subForm') {
      return _.pick(formLayout, subFormKeys)
    }
    if (type === 'iframe') {
      return _.pick(formLayout, iframeKeys)
    }
    if (type === 'sla') {
      return _.pick(formLayout, slaKeys)
    }
    if (type === 'relateTicket') {
      return _.pick(formLayout, relateTicketKeys)
    }
    if (type === 'group') {
      const fields = _.map(fieldList, field => {
        if (field.type === 'iframe') {
          return _.pick(field, iframeKeys)
        }
        if (field.type === 'sla') {
          return _.pick(field, slaKeys)
        }
        if (type === 'relateTicket') {
          return _.pick(formLayout, relateTicketKeys)
        }
        return field
      })
      return _.assign({}, formLayout, { fieldList: fields })
    } else if (type === 'tab') {
      return _.assign({}, formLayout, {
        tabs: _.map(tabs, tab => {
          return _.assign({}, tab, {
            fieldList: _.map(tab.fieldList, field => {
              if (field.type === 'iframe') {
                return _.pick(field, iframeKeys)
              }
              if (field.type === 'sla') {
                return _.pick(field, slaKeys)
              }
              if (type === 'relateTicket') {
                return _.pick(formLayout, relateTicketKeys)
              }
              return field
            })
          })
        })
      })
    }
  })
}

export default getFields
