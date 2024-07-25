import { International } from '@uyun/everest-i18n'

import locales from './locale.json'

export function getCookie(name) {
  var value = '; ' + document.cookie
  var parts = value.split('; ' + name + '=')
  if (parts.length === 2) {
    return parts
      .pop()
      .split(';')
      .shift()
  }
}

const intl = new International({
  language: getCookie('language') || 'zh_CN',
  locale: locales
})

const { i18n } = intl

export {
  i18n,
  i18n as __
}

export default intl

