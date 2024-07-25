import arrayFlat from './arrayFlat'
/**
 * 过滤出符合条件的字段code
 * @param {*} formLayoutVos
 * @param {*} codeTypes 需要过滤的字段类型
 * @param {string} type hidden 当前没有被隐藏的code ，code 根据codeTypes过滤出字段类型属于codeTypes的code
 */
const getFieldCodes = (fieldList, codeTypes, type) => {
  let fields = [] // 符合条件的字段code
  if (type === 'code') {
    fields = _.filter(fieldList, field => _.includes(codeTypes, field.type))
  } else if (type === 'hidden') {
    fields = _.filter(fieldList, field => !field.hidden)
  }
  return _.map(fields, field => field.code)
}

const getCodes = (formLayoutVos, codeTypes, type = 'code') => {
  const codes = _.map(formLayoutVos, formLayout => {
    if (type === 'hidden' && formLayout.hidden) {
      return []
    }
    if (formLayout.type === 'group') {
      return getFieldCodes(formLayout.fieldList, codeTypes, type)
    } else {
      _.map(formLayout.tabs, tab => {
        if (type === 'hidden' && tab.hidden) {
          return []
        }
        return getFieldCodes(tab.fieldList, codeTypes, type)
      })
    }
  })
  return arrayFlat(codes)
}

export default getCodes
