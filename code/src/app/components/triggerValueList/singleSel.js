import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Select } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
import classnames from 'classnames'
const Option = Select.Option

class SignleSel extends Component {
  static propTypes = {
    value: PropTypes.string,
    params: PropTypes.array,
    handleChange: PropTypes.func
  }

  getList = (query, callback) => {
    let { formData, headers, outsideUrl, raw, requestType, keySel, valueSel, keyword, filterMode } =
      this.props.params
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

  parseValue = (value) => {
    if (!value) {
      return undefined
    } else if (Array.isArray(value)) {
      return value.map((item) => ({ key: item.value, label: item.label }))
    } else {
      return { key: value.value, label: value.label }
    }
  }

  getDicList = async (query, callback) => {
    const params = {
      page_num: query.pageNo,
      page_size: query.pageSize,
      kw: query.kw
    }
    const res =
      (await axios.get(API.queryDictionaryData(this.props.params.dictionarySource), { params })) ||
      {}
    let list = res.list || []
    list = list.map((item) => ({ id: item.id, name: item.name }))

    callback(list)
  }

  render() {
    const { value, params, disabled, handleChange, comparsionType } = this.props
    const clsName = classnames({
      'disabled-item': disabled
    })
    if (comparsionType === 'listSel' && params.tabStatus === '1') {
      return (
        <LazySelect
          filterWithoutQuery={params.filterMode === 0}
          className={clsName}
          disabled={disabled}
          placeholder={i18n('pls_select', '请选择')}
          dropdownMatchSelectWidth={false}
          labelInValue
          getList={this.getList}
          value={this.parseValue(value)}
          onChange={handleChange}
        />
      )
    }
    if (comparsionType === 'listSel' && params.tabStatus === '2') {
      return (
        <LazySelect
          placeholder={`${i18n('ticket.create.select', '请选择')}`}
          className={clsName}
          disabled={disabled}
          mode={params.isSingle === '1' ? 'multiple' : ''}
          value={value}
          labelInValue
          getList={this.getDicList}
          onChange={handleChange}
          getPopupContainer={(triggerNode) => triggerNode || document.body}
        />
      )
    }
    return (
      <Select
        disabled={disabled}
        showSearch
        value={value}
        onChange={handleChange}
        optionFilterProp="children"
        placeholder={i18n('globe.select', '请选择')}
        notFoundContent={i18n('globe.notFound', '无法找到')}
      >
        {_.map(params, (item) => (
          <Option key={item.value} value={`${item.value}`}>
            {item.name || item.label}
          </Option>
        ))}
      </Select>
    )
  }
}
export default SignleSel
