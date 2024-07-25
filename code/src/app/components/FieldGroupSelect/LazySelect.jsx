import React, { Component } from 'react'
import LazySelect from '~/components/lazyLoad/lazySelect'

class FieldGroupLazySelect extends Component {
  getList = async (query, callback) => {
    const params = _.omit({ ...query, page_num: query.pageNo, page_size: query.pageSize }, ['pageNo', 'pageSize'])
    const res = await axios.get(API.queryDictionaryData('field_layout'), { params }) || {}
    let list = res.list || []
    list = _.map(list, item => ({ name: item.name, id: item.id }))
    callback(list)
  }

  render() {
    const { value, onChange, style, labelInValue = false } = this.props
    return (
      <LazySelect
        value={value}
        labelInValue={labelInValue}
        style={style}
        onChange={onChange}
        getList={this.getList}
        placeholder={i18n('pls_sel_field_group')}
        getPopupContainer={triggerNode => triggerNode.parantNode || document.body}
      />
    )
  }
}

export default FieldGroupLazySelect
