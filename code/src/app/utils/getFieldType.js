export default function getFieldType(code) {
  let typeDesc = '',
    type = ''
  switch (code) {
    case 'ticketName':
    case 'ticketNum':
    case 'processName':
    case 'tacheName':
    case 'status':
      type = 'singleRowText'
      typeDesc = '单行文本'
      break
    case 'priority':
      type = 'singleSel'
      typeDesc = '单选'
      break
    case 'creatorName':
    case 'participants':
      type = 'user'
      typeDesc = '人员'
      break
    case 'executorAndGroup':
      type = 'userGroup'
      typeDesc = '处理人/组'
      break
    case 'creatorTime':
    case 'updateTime':
      type = 'dateTime'
      typeDesc = '时间日期'
      break
    default:
      break
  }
  return { type, typeDesc }
}
