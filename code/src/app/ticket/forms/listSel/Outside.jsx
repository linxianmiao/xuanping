import React, { Component } from 'react'
import { Select } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
import classnames from 'classnames'

function toQueryString(params) {
  return Object.keys(params)
    .filter((key) => params[key])
    .map((key) => {
      if (params[key]) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      }
    })
    .join('&')
}

class Outside extends Component {
  getList = (query, callback) => {
    let {
      code,
      formData,
      headers,
      outsideUrl,
      raw,
      requestType,
      keySel,
      valueSel,
      keyword,
      filterMode
    } = this.props.field
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
    let params = {}
    if (query.kw || window[`${code}_outsideParams`]) {
      params = { [keyword]: query.kw, ...window[`${code}_outsideParams`] }
      const sign = body.outsideUrl.indexOf('?') > -1 ? '&' : '?'
      body.outsideUrl = body.outsideUrl + sign + toQueryString(params)
    }

    axios.post(API.get_value_by_request, body).then((res) => {
      let { list } = res || {}

      list = list.map((item) => ({ id: item.value, name: item.label }))
      callback(list)
    })
  }

  handleChange = (value) => {
    let nextValue

    if (!value) {
      nextValue = undefined
    } else if (Array.isArray(value)) {
      nextValue = value.map((item) => ({ label: item.label, value: item.key }))
    } else {
      nextValue = { label: value.label, value: value.key }
    }

    this.props.onChange(nextValue)
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
    const { disabled, field, value, containerId } = this.props
    const { isChangeOutsideParams, params } = field
    const clsName = classnames({
      'disabled-item': disabled
    })
    // const container = document.getElementById(`${containerId}`)

    return isChangeOutsideParams ? (
      <Select
        labelInValue
        className={clsName}
        id={field.code}
        disabled={field.isRequired === 2}
        placeholder={field.isRequired === 2 ? '' : i18n('pls_select', '请选择')}
        mode={field.isSingle === '1' ? 'multiple' : ''}
        value={this.parseValue(value)}
        // getPopupContainer={() => container || document.body}
        getPopupContainer={(triggerNode) => triggerNode || document.body}
        onChange={this.handleChange}
      >
        {params.map((item) => (
          <Select.Option key={`${item.value}`}>{item.label}</Select.Option>
        ))}
      </Select>
    ) : (
      <LazySelect
        filterWithoutQuery={field.filterMode === 0}
        className={clsName}
        disabled={field.isRequired === 2}
        id={field.code}
        placeholder={field.isRequired === 2 ? '' : i18n('pls_select', '请选择')}
        dropdownMatchSelectWidth={false}
        getPopupContainer={(triggerNode) => triggerNode || document.body}
        labelInValue
        mode={field.isSingle === '1' ? 'multiple' : ''}
        getList={this.getList}
        value={this.parseValue(value)}
        onChange={this.handleChange}
      />
    )
  }
}

export default Outside
