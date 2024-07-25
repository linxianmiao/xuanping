/**
 * 所属应用选择
 */
import React, { Component } from 'react'
import LazySelect from '~/components/lazyLoad/lazySelect'

export default class AppSelect extends Component {
  static defaultProps = {
    value: undefined,  // { key, label }
    onChange: () => {}
  }

  getList = async (query, callback) => {
    const params = { pageNum: query.pageNo, pageSize: query.pageSize }
    const res = await axios.get(API.queryAppAccessList, { params }) || {}
    let list = res.list || []
    list = list.map(item => ({ id: item.appCode, name: item.appName }))
    if (query.pageNo === 1) {
      // 前端自己拼接一个ITSM选项
      list.unshift({ id: '1008', name: 'ITSM' })
    }
    callback(list)
  }

  render() {
    const { value, onChange, ...restProps } = this.props

    return (
      <LazySelect
        placeholder={`${i18n('ticket.create.select', '请选择')}`}
        value={value}
        labelInValue
        getList={this.getList}
        onChange={onChange}
        {...restProps}
      />
    )
  }
}
