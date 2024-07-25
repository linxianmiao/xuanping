import React, { Component } from 'react'
import classnames from 'classnames'
import { Select } from '@uyun/components'
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
    const { disabled, field, value, onChange } = this.props

    const { isChangeDictionaryParams, params } = field
    const clsName = classnames({
      'disabled-item': disabled
    })

    return isChangeDictionaryParams ? (
      <Select
        labelInValue
        id={field.code}
        className={clsName}
        disabled={field.isRequired === 2}
        placeholder={field.isRequired === 2 ? '' : `${i18n('ticket.create.select', '请选择')}`}
        mode={field.isSingle === '1' ? 'multiple' : ''}
        value={value}
        getPopupContainer={(triggerNode) => triggerNode || document.body}
        onChange={onChange}
      >
        {params.map((item) => (
          <Select.Option key={`${item.value}`}>{item.label}</Select.Option>
        ))}
      </Select>
    ) : (
      <LazySelect
        id={field.code}
        placeholder={field.isRequired === 2 ? '' : `${i18n('ticket.create.select', '请选择')}`}
        className={clsName}
        disabled={field.isRequired === 2}
        mode={field.isSingle === '1' ? 'multiple' : ''}
        value={value}
        labelInValue
        getList={this.getList}
        onChange={onChange}
        getPopupContainer={(triggerNode) => triggerNode || document.body}
      />
    )
  }
}
