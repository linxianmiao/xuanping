/**
 * 将创建字段里的数据改成下拉菜单可以识别的数据
 */

import dataType from '~/create-field/config/dataType'
const { fieldType } = dataType
const list = _.map(fieldType, type => {
  return {
    value: type,
    label: dataType[type].name
  }
})
export default list