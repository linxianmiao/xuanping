import React, { Component } from 'react'
import { inject } from '@uyun/core'
import LazySelect from '../LazySelect'

class ModelTypeLazySelect extends Component {
  @inject('i18n') i18n

  @inject('api') api

  getList = async (query, callback) => {
    const nextQuery = _.omit({ ...query, pageNum: query.pageNo }, 'pageNo')
    const { list = [] } = await this.api.queryModelTypes(nextQuery) || {}
    const nextList = list.map(item => ({ name: item.name, id: item.code }))

    callback(nextList)
  }

  render() {
    const { value, onChange, style, labelInValue = false } = this.props

    return (
      <LazySelect
        placeholder={this.i18n('pls_select_modelType', '请选择模型类型')}
        style={style}
        labelInValue={labelInValue}
        getList={this.getList}
        value={value}
        onChange={onChange}
      />
    )
  }
}

export default ModelTypeLazySelect
