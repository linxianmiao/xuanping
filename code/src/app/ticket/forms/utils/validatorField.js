/**
 * 校验JSON是否符合规范，并返回错误信息
 * @param {Object} r 规则
 * @param {String} v 值
 */
export function validJson(r, v) {
  if (v == null || v === '') {
    return { isError: _.get(r, 'required'), errorMes: i18n('cannotBeEmpty', '不能为空', { name: _.get(r, 'name') }) }
  }
  try {
    if (_.isObject(JSON.parse(v))) return { isError: false }

    return {
      isError: false,
      errorMes: i18n('formatIncorrect', '格式不正确', { name: _.get(r, 'name') || 'JSON' })
    }
  } catch (e) {
    return {
      isError: true,
      errorMes: i18n('formatIncorrect', '格式不正确', { name: _.get(r, 'name') || 'JSON' })
    }
  }
}