import { store as runtimeStore } from '@uyun/runtime-react'
import { IPV4Regx, IPV6Regx, IpV4V6Regx, IpV4V6RageRegx } from '~/utils/common'

/**
 *  将对象转成文本
 * @param {Object} obj
 */
export function stringify(obj) {
  return JSON.stringify(obj, function(_, val) {
    if (val instanceof RegExp || val instanceof Function) {
      return val.toString()
    }
    if (val === undefined) {
      return ''
    }
    return val
  })
}

/**
 * 字段中字符串的匹配规则
 * @param {String} text
 * @param {String} validation 匹配正则类型
 * @param {RegExp} customReg 自定义正则，当validation为'reg'时用到
 */
export function matchReg(text, validation, customReg) {
  let reg // 正则。多个正则用数组表示
  let message = ''
  let match = true

  switch (validation) {
    case 'IP':
      reg = [IPV4Regx, IPV6Regx, IpV4V6Regx, IpV4V6RageRegx]
      message = i18n('ticket.form.IP', '不符合IP校验规则')
      break
    case 'mobile':
      reg = runtimeStore.getState().language === 'zh_CN' ? /^1[3456789]\d{9}$/ : /^([0-9-]*)$/
      message = i18n('ticket.form.mobile', '不符合手机校验规则')
      break
    case 'email':
      reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/
      message = i18n('ticket.form.email', '不符合邮箱校验规则')
      break
    case 'reg':
      reg = eval(customReg)
      message = i18n('ticket.form.reg', '不符合正则表达式校验规则')
      break
    default:
      break
  }

  if (reg) {
    match = Array.isArray(reg)
      ? reg.some(item => item.test(text))
      : reg.test(text)
  }

  return {
    match,
    message
  }
}