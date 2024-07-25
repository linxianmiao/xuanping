import React from 'react'
import { Text } from '~/components/SelectWithColor'
import { getDateTimeValue } from '~/public/logic/dateTime'
import TextPreview from '~/components/TextPreview'

const renderOptionalValue = (value, options = []) => {
  if (typeof value === 'string' || typeof value === 'number') {
    const item = options.find((option) => `${option.value}` === `${value}`)
    return item ? item.label : null
  } else {
    return value.label || null
  }
}

const ReadOnly = (props) => {
  const { value, type, field, fieldCode } = props

  if (value === undefined || value === null) {
    return null
  }
  if (type === 'normal' || type === 'singleRowText') {
    return value
  }
  if (type === 'multiRowText') {
    return (
      <TextPreview uuId={`${field.code}${fieldCode}`} field={{ ...field }} className="pre-wrap">
        {value}
      </TextPreview>
    )
  }
  if (type === 'int' || type === 'double') {
    return (
      <>
        {value}
        {!!value && <span style={{ color: '#6ca4cd' }}>{field.unit}</span>}
      </>
    )
  }
  if (type === 'dateTime') {
    const format =
      field.timeGranularity === 2
        ? 'YYYY-MM-DD'
        : field.timeGranularity === 3
        ? 'YYYY-MM-DD HH:mm'
        : field.timeGranularity === 4
        ? 'YYYY-MM-DD HH:mm:ss'
        : 'YYYY-MM'
    const datetime = getDateTimeValue(value)
    return datetime ? datetime.format(format) : ''
  }
  // 单选字段 会有颜色
  if (type === 'singleSel') {
    const options = field.params || []
    const item = options.find((option) => `${option.value}` === `${value}`)

    if (item) {
      return (
        <Text isChooseColor={field.isChooseColor} color={item.color}>
          {item.label}
        </Text>
      )
    }
    return null
  }
  if (type === 'links') {
    const { linkProtocol, linkUrl, linkName } = value || {}
    if (linkName) {
      return (
        <a target="_blank" href={`${linkProtocol}${linkUrl}`} rel="noreferrer">
          {linkName}
        </a>
      )
    }
    return <span>{i18n('edit', '编辑')}</span>
  }

  if (type === 'cascader') {
    const options = field.cascade
    if (!options) return ''
    let formatValue = ''
    if (Array.isArray(value) && value.length > 0) {
      let optionx = {}
      _.forEach(value, (data, i) => {
        if (i < value.length) {
          if (_.isEmpty(optionx)) {
            optionx = options.find((d) => d.value === data)
          } else {
            optionx = optionx.children.find((d) => d.value === data)
          }
          formatValue += `/${optionx.label}`
        }
      })
    }
    return formatValue.substring(1, formatValue.length)
  }

  // 以下是选项类型的
  if (Array.isArray(value)) {
    return value
      .map((item) => renderOptionalValue(item, field.params))
      .filter(Boolean)
      .join()
  } else {
    return renderOptionalValue(value, field.params)
  }
}

export default ReadOnly
