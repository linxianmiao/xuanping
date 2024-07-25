import React from 'react'
import LazySelect from '~/components/lazyLoad/lazySelect'

const OutsideSelect = (props) => {
  const { disabled, field, value } = props

  // 找出api关联的规则，调整下格式，方便过滤参数
  const parseApiRules = () => {
    const { tableRules } = props
    const rules = []

    if (!tableRules || tableRules.length === 0) {
      return rules
    }

    tableRules
      .filter((item) => item.type === 'api')
      .forEach((item) => {
        item.apiRules.forEach((rule) => {
          rules.push({
            ...rule,
            observableCell: item.observableCell
          })
        })
      })

    return rules
  }
  const findParams = () => {
    const { column, record, columns, fields } = props
    const params = {}
    const apiRules = parseApiRules()

    apiRules
      .filter((item) => item.observerCell === column.value)
      .forEach((item) => {
        const { observableCell } = item
        item.conditions.forEach((cond) => {
          const { paramName, observableCellExpandCode } = cond
          const observableColumn = columns.find((col) => col.value === observableCell)
          const field = _.find(fields, (data) => data.code === observableColumn.source) || {}
          const param =
            _.find(
              field.params,
              (data) => data.value === _.get(record, `${observableCell}.value`)
            ) || {}

          if (observableCellExpandCode === '_value') {
            params[paramName] =
              field.tabStatus === '1' && record[observableCell]
                ? record[observableCell].value
                : record[observableCell]
          } else {
            params[paramName] = _.get(param, `listSelExpand.${observableCellExpandCode}`)
          }
        })
      })

    return params
  }

  const getList = (query, callback) => {
    let { code, keyword } = props.field
    keyword = keyword || 'kw'
    const params = {
      code,
      modelId: props.modelId || '',
      pageNo: query.pageNo,
      pageSize: query.pageSize
    }
    let body = findParams()

    if (query.kw) {
      body[keyword] = encodeURIComponent(query.kw) // 外部接口需要支持kw关键字查询
    }

    if (window[`${props.field.code}_outsideParams`]) {
      body = {
        ...body,
        ...window[`${props.field.code}_outsideParams`]
      }
    }
    axios.post(API.getOutSideByCode, body, { params }).then((res) => {
      let { list } = res || {}

      list = list.map((item) => ({ ...item, id: item.value, name: item.label }))
      callback(list)
    })
  }

  const handleChange = (value, selected) => {
    let nextValue

    if (!value) {
      nextValue = undefined
    } else if (Array.isArray(value)) {
      nextValue = value.map((item) => ({ label: item.label, value: item.key }))
    } else {
      nextValue = { label: value.label, value: value.key }
    }

    props.onChange(nextValue, selected)
  }

  const parseValue = (value) => {
    if (!value) {
      return undefined
    } else if (Array.isArray(value)) {
      return value.map((item) => ({ key: `${item.value}`, label: item.label }))
    } else {
      return { key: `${value.value}`, label: value.label }
    }
  }
  return (
    <LazySelect
      filterWithoutQuery={field.filterMode === 0 ? true : false}
      disabled={disabled}
      placeholder={i18n('pls_select', '请选择')}
      dropdownMatchSelectWidth={false}
      labelInValue
      mode={field.isSingle === '1' ? 'multiple' : ''}
      getList={getList}
      value={parseValue(value)}
      onChange={handleChange}
      size={props.size}
    />
  )
}

export default OutsideSelect
