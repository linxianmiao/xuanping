export function getActionType (type) {
  let x = ''
  switch (type) {
    case 1:
      x = i18n('globe.create', '创建')
      break
    case 2:
      x = i18n('globe.submit', '提交')
      break
    case 3:
      x = i18n('globe.rollback', '回退')
      break
    case 4:
      x = i18n('globe.reassign', '改派')
      break
    case 5:
      x = i18n('globe.abolish', '废除')
      break
    case 6:
      x = i18n('globe.accept', '接单')
      break
    case 7:
      x = i18n('globe.jump', '跳转')
      break
    case 8:
      x = i18n('globe.rescind', '撤销')
      break
    case 9:
      x = i18n('globe.close', '关闭')
      break
    case 10:
      x = i18n('globe.revoke', '取回')
      break
    case 11:
      x = i18n('globe.reopen', '重开')
      break
  }
  return x
}
