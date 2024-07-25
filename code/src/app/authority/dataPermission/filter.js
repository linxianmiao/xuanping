import React, { Component } from 'react'
import { Input, Select } from '@uyun/components'
import styles from './index.module.less'
const { Option } = Select
export default class Filter extends Component {
  render() {
    const { kw, categoryCodeList, categoryCode } = this.props
    return (
      <div className={styles.dataPermissionFilter}>
        <div>
          <Input.Search
            allowClear
            value={kw}
            style={{ width: 256 }}
            onChange={e => { this.props.handleChangeDataTableQuery({ kw: e.target.value }) }}
            placeholder={i18n('ticket.list.screent.kw', '请输入关键字')}
          />
          <Select
            showSearch
            allowClear
            value={categoryCode}
            optionFilterProp="children"
            style={{ width: 256, marginLeft: 15 }}
            placeholder={i18n('globe.select', '请选择')}
            notFoundContent={i18n('globe.notFound', '无法找到')}
            onChange={value => { this.props.handleChangeDataTableQuery({ categoryCode: value }) }}>
            {_.map(categoryCodeList, item => <Option key={item.code} value={item.code}>{item.name}</Option>)}
          </Select>
        </div>
        {this.props.children}
      </div>
    )
  }
}