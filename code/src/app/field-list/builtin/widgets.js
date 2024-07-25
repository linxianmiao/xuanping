import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Input, Select } from '@uyun/components'
import { getFieldList } from '~/components/formSet/formLayoutVos/configuration'

@inject('fieldListBuiltinStore')
@observer
class Widgets extends Component {
  handleChange = (data, type) => {
    const { query } = this.props.fieldListBuiltinStore
    this.props.fieldListBuiltinStore.setProps({
      query: _.assign({}, query, { [type]: data })
    })
    // 不是输入框变化，或者清空输入框
    if (type !== 'wd' || !data) {
      this.handleSearch()
    }
  }

  handleSearch = () => {
    const { query } = this.props.fieldListBuiltinStore
    this.props.fieldListBuiltinStore.setProps({ query: { ...query, pageNo: 1 } })
    this.props.fieldListBuiltinStore.getFieldList()
  }

  render() {
    const { fieldListBuiltinStore } = this.props
    const { query } = fieldListBuiltinStore
    const { wd, type } = query || {}

    return (
      <div className="extend-filter">
        <div>
          <Input.Search
            style={{ width: 256, marginRight: 15 }}
            placeholder={i18n('input_keyword', '请输入关键字')}
            allowClear
            enterButton
            value={wd}
            onChange={(e) => this.handleChange(e.target.value, 'wd')}
            onSearch={this.handleSearch}
          />
          <Select
            allowClear
            showSearch
            value={type}
            style={{ width: 256 }}
            optionFilterProp="children"
            onChange={(value) => this.handleChange(value, 'type')}
            placeholder={`${i18n('globe.select', '请选择')}${i18n(
              'field_header_type',
              '字段类型'
            )}`}
            notFoundContent={i18n('ticket.comment.notfind', '无法找到')}
          >
            {getFieldList().map((item) => {
              return (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              )
            })}
          </Select>
        </div>
      </div>
    )
  }
}

export default Widgets
