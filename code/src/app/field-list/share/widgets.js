import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Input, Select, TreeSelect } from '@uyun/components'
import { getFieldList } from '~/components/formSet/formLayoutVos/configuration'

@inject('fieldListShareStore')
@observer
class Widgets extends Component {
  componentDidMount() {
    this.props.fieldListShareStore.getSourceList()
  }

  handleChange = (data, type) => {
    const { query } = this.props.fieldListShareStore
    this.props.fieldListShareStore.setProps({
      query: _.assign({}, query, { [type]: data })
    })
    if (type !== 'wd') {
      this.handleSearch()
    }
  }

  handleSearch = () => {
    const { query } = this.props.fieldListShareStore
    this.props.fieldListShareStore.setProps({ query: { ...query, pageNo: 1 } })
    this.props.fieldListShareStore.getFieldList()
  }

  render() {
    const { fieldListShareStore } = this.props
    const { query, sourceList } = fieldListShareStore
    const { wd, type, businessUnitIds } = query || {}
    return (
      <div className="extend-filter">
        <div>
          <Input.Search
            style={{ width: 256, marginRight: 15 }}
            placeholder={i18n('input_keyword', '请输入关键字')}
            allowClear
            value={wd}
            enterButton
            onChange={(e) => this.handleChange(e.target.value, 'wd')}
            onSearch={this.handleSearch}
            onClear={() => {
              this.handleChange(undefined, 'wd')
              this.handleSearch()
            }}
          />
          <Select
            allowClear
            showSearch
            value={type}
            style={{ width: 256, marginRight: 15 }}
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
          <TreeSelect
            style={{ width: 256 }}
            showSearch
            treeNodeFilterProp="title"
            value={businessUnitIds}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder={`${i18n('globe.select', '请选择')}${i18n('tip8', '来源')}`}
            allowClear
            treeDataSimpleMode
            onChange={(value) => this.handleChange(value, 'businessUnitIds')}
            treeData={sourceList}
          />
        </div>
      </div>
    )
  }
}

export default Widgets
