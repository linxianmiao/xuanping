import React, { Component } from 'react'
import LazySelect from '~/components/lazyLoad/lazySelect'

class Outside extends Component {
  getList = (query, callback) => {
    let { formData, headers, outsideUrl, raw, requestType, keySel, valueSel, keyword, filterMode } =
      this.props.field
    keyword = keyword || 'kw'
    const body = {
      formData,
      headers,
      outsideUrl,
      raw,
      requestType,
      keySel,
      valueSel,
      keyword,
      filterMode,
      type: 'listSel',
      pageNo: query.pageNo,
      pageSize: query.pageSize
      // pageSize: 9999
    }

    if (query.kw) {
      const sign = body.outsideUrl.indexOf('?') > -1 ? '&' : '?'
      body.outsideUrl = body.outsideUrl + sign + `${keyword}=` + encodeURIComponent(query.kw)
    }

    axios.post(API.get_value_by_request, body).then((res) => {
      let { list } = res || {}

      list = list.map((item) => ({ id: item.value, name: item.label }))
      callback(list)
    })
  }

  handleChange = (value) => {
    const { code, noLabel } = this.props
    let nextValue

    if (!value) {
      nextValue = undefined
    } else if (Array.isArray(value)) {
      nextValue = value.map((item) => ({ label: item.label, value: item.key }))
    } else {
      nextValue = { label: value.label, value: value.key }
    }

    if (noLabel) {
      this.props.handleChange({ [code]: value })
    } else {
      this.props.onChange(nextValue)
    }
  }

  parseValue = (value) => {
    if (!value) {
      return undefined
    } else if (Array.isArray(value)) {
      return value.map((item) => ({ key: item.value, label: item.label }))
    } else {
      return { key: value.value, label: value.label }
    }
  }

  render() {
    const { disabled, field, value, size } = this.props

    return (
      <LazySelect
        size={size}
        filterWithoutQuery={field.filterMode === 0}
        disabled={disabled}
        placeholder={`${i18n('globe.select', '请选择')}${field.name}`}
        dropdownMatchSelectWidth={false}
        labelInValue
        mode="multiple"
        getList={this.getList}
        value={this.parseValue(value)}
        onChange={this.handleChange}
        className="filter-item-select"
      />
    )
  }
}

export default Outside
