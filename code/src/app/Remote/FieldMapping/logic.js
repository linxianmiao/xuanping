// 根据传入的字段类型，获取可映射的字段类型
export function getAvailableFieldTypes(type) {
  switch (type) {
    case 'singleRowText':
    case 'multiRowText':
      return ['singleRowText', 'multiRowText', 'richText']
    case 'listSel':
      return ['listSel']
    case 'singleSel':
      return ['singleSel', 'singleRowText']
    case 'multiSel':
      return ['multiSel', 'multiRowText']
    case 'int':
      return ['int', 'double']
    case 'double':
      return ['double']
    case 'dateTime':
      return ['dateTime']
    case 'timeInterval':
      return ['timeInterval']
    case 'department':
      return ['department']
    case 'user':
      return ['user']
    // case 'cascader':
    //   return ['cascader']
    // case 'treeSel':
    //   return ['treeSel']
    case 'richText':
      return ['richText', 'multiRowText']
    // case 'securityCode':
    //   return ['securityCode']
    case 'attachfile':
      return ['attachfile']
    case 'resource':
      return ['resource']
    // case 'tags':
    //   return ['tags']
    case 'links':
      return ['links']
    case 'safe-event-source':
      return ['safe-event-source']
    default:
      return []
  }
}

/**
 * 判断已映射字段是否全选
 * @param {Array} data 筛选后的数据
 * @param {Array} selected 选中的数据
 * @returns {Object} { isCheckAll, indeterminate }
 */
export function getMappingFieldsCheckAllInfo(data = [], selected = []) {
  let indeterminate = false
  let isCheckAll = true

  if (selected.length === 0) {
    isCheckAll = false
  } else {
    data.forEach((item) => {
      if (
        !selected.some(
          (sItem) =>
            sItem.parFieldCode === item.parFieldCode && sItem.subFieldCode === item.subFieldCode
        )
      ) {
        indeterminate = true
        isCheckAll = false
      }
    })
  }

  return {
    indeterminate,
    isCheckAll
  }
}
