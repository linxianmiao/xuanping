import { intl } from '@uyun/utils'

const locales = [
  ...require('@public/locales/error.json'),
  ...require('@public/locales/i18n.json')
]

intl.merge(locales)
