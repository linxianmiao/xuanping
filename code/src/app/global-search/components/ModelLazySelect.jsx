import React, { Component } from 'react'
import LazySelect from '~/components/lazyLoad/lazySelect'

export default class ModelLazySelect extends Component {
  getList = async(query, callback) => {
    const { pageSize, pageNo, kw } = query

    let data = []

    const params = { pageNo, pageSize, kw }
    const res = await axios.get(API.queryAuthModelList, { params }) || {}
    data = _.map(res.list, item => ({ id: item.processId, name: item.processName }))

    callback(data)
  }

  render() {
    const { value } = this.props

    return (
      <LazySelect
        placeholder={`${i18n('globe.select', '请选择')}${i18n('sla_ticket_type', '工单类型')}`}
        mode="multiple"
        labelInValue={false}
        getList={this.getList}
        value={value}
        onChange={this.props.onChange}
        getPopupContainer={triggerNode => triggerNode.parentNode}
      />
    )
  }
}
