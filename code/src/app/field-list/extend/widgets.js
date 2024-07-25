import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { Input, Select, Button } from '@uyun/components'
import { getFieldList } from '~/components/formSet/formLayoutVos/configuration'
import FieldGroupLazySelect from '~/components/FieldGroupSelect/LazySelect'

@inject('fieldListExtendStore', 'globalStore')
@withRouter
@observer
class Widgets extends Component {
  handleChange = (data, type) => {
    const { query } = this.props.fieldListExtendStore
    this.props.fieldListExtendStore.setProps({
      query: _.assign({}, query, { [type]: data })
    })
    // 不是输入框变化，或者清空输入框
    if (type !== 'wd' || !data) {
      this.handleSearch()
    }
    this.props.onSelectChange()
  }

  handleFieldGroupChange = (value) => {
    const { query } = this.props.fieldListExtendStore
    this.props.fieldListExtendStore.setProps({
      query: _.assign({}, query, { layoutId: value && value.key }),
      selectedFieldGroup: value
    })
    this.handleSearch()
    this.props.onSelectChange()
  }

  handleSearch = () => {
    const { query } = this.props.fieldListExtendStore
    this.props.fieldListExtendStore.setProps({ query: { ...query, pageNo: 1 } })
    this.props.fieldListExtendStore.getFieldList()
  }

  handleCreate = () => {
    if (this.props.appkey) {
      this.props.history.push(`/conf/field/create?appkey=${this.props.appkey}`)
    } else {
      this.props.history.push(`/conf/field/create`)
    }
  }

  render() {
    const { fieldListExtendStore, globalStore } = this.props
    const { fieldInsert } = globalStore.configAuthor
    const { query, selectedFieldGroup } = fieldListExtendStore
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
          <FieldGroupLazySelect
            style={{ width: 256, marginRight: 15, verticalAlign: 'bottom' }}
            clearOnClose
            labelInValue
            value={selectedFieldGroup}
            onChange={this.handleFieldGroupChange}
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
        {fieldInsert && (
          <div>
            <Button type="primary" style={{ marginLeft: 15 }} onClick={this.handleCreate}>
              {i18n('new_field', '新建字段')}
            </Button>
          </div>
        )}
      </div>
    )
  }
}

export default Widgets
