import React, { Component } from 'react'
import LazySelect from './lazySelect'
import _ from 'lodash'
import { request, i18n } from '../utils'

class FieldGroupLazySelect extends Component {
  getList = async (query, callback) => {
    const params = _.omit({ ...query, page_num: query.pageNo, page_size: query.pageSize }, ['pageNo', 'pageSize'])
    const res = await request.get('/itsm/api/v2/dic/queryDataByDicCode?dicCode=field_layout', { params }) || {}
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
        placeholder={i18n('field-layout-placeholder', '请选择字段分组')}
        getPopupContainer={triggerNode => triggerNode.parantNode || document.body}
      />
    )
  }
}

export default FieldGroupLazySelect
