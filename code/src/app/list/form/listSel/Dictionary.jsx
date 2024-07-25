import React, { Component } from 'react'
import LazySelect from '~/components/lazyLoad/lazySelect'

export default class Dictionary extends Component {
  getList = async (query, callback) => {
    const { field } = this.props
    const params = {
      page_num: query.pageNo,
      page_size: query.pageSize,
      kw: query.kw
    }
    const res = (await axios.get(API.queryDictionaryData(field.dictionarySource), { params })) || {}
    let list = res.list || []
    list = list.map((item) => ({ id: item.id, name: item.name }))

    callback(list)
  }

  render() {
    const { disabled, field, size, value, onChange, handleChange, noLabel, code } = this.props

    return (
      <LazySelect
        placeholder={`${i18n('globe.select', '请选择')}${field.name}`}
        size={size}
        disabled={disabled}
        mode="multiple"
        value={value}
        labelInValue
        getList={this.getList}
        onChange={
          noLabel
            ? (value) => {
                handleChange({ [code]: value })
                onChange(value)
              }
            : onChange
        }
        className="filter-item-select"
      />
    )
  }
}
