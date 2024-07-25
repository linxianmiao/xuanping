import React, { Component } from 'react'
import classnames from 'classnames'
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
    const { disabled, field, value, onChange, size } = this.props
    const clsName = classnames({
      'disabled-item': disabled
    })

    return (
      <LazySelect
        placeholder={`${i18n('ticket.create.select', '请选择')}`}
        className={clsName}
        disabled={disabled}
        mode={field.isSingle === '1' ? 'multiple' : ''}
        value={value}
        labelInValue
        getList={this.getList}
        onChange={onChange}
        size={size || 'middle'}
      />
    )
  }
}
