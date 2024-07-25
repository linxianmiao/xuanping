import React, { Component } from 'react'
import LazySelect from '~/components/lazyLoad/lazySelect'

class ModelTypeLazySelect extends Component {
  getList = async (query, callback) => {
    const nextQuery = _.omit({ ...query, page_num: query.pageNo, page_size: query.pageSize }, ['pageNo', 'pageSize'])
    const { list = [] } = await axios.get(API.queryDictionaryData('model_type'), { params: nextQuery }) || {}
    const nextList = list.map(item => ({ name: item.name, id: item.value }))
    callback(nextList)
  }

  render() {
    const { value, onChange, style, labelInValue = false } = this.props
    return (
      <LazySelect
        placeholder={i18n('pls_select_modelType', '请选择模型类型')}
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
