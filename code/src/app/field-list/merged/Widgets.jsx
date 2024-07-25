import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { Input, Select, Button } from '@uyun/components'
import { getFieldList } from '~/components/formSet/formLayoutVos/configuration'
import FieldGroupLazySelect from '~/components/FieldGroupSelect/LazySelect'
import { linkTo } from '~/components/LowcodeLink'
import AppDataTabs from '~/components/LowcodeLink/AppDataTabs'
import { orLowcode } from '~/utils/common'
import styles from './index.module.less'

@inject('globalStore')
@withRouter
@observer
class Widgets extends Component {
  handleChange = (data, type) => {
    const { query } = this.props.fieldListMergedStore
    const nextQuery = { ...query, [type]: data }

    if (type === 'scope' && data === '1') {
      nextQuery.layoutId = undefined
      this.props.fieldListMergedStore.setProps({ selectedFieldGroup: undefined })
    }

    this.props.fieldListMergedStore.setProps({
      query: nextQuery
    })
    // 不是输入框变化，或者清空输入框
    if (type !== 'wd' || !data) {
      this.handleSearch()
    }
    this.props.onSelectChange()
  }

  handleFieldGroupChange = (value) => {
    const { query } = this.props.fieldListMergedStore
    this.props.fieldListMergedStore.setProps({
      query: _.assign({}, query, { layoutId: value && value.key }),
      selectedFieldGroup: value
    })
    this.handleSearch()
    this.props.onSelectChange()
  }

  handleSearch = () => {
    const { query } = this.props.fieldListMergedStore
    this.props.fieldListMergedStore.setProps({ query: { ...query, pageNo: 1 } })
    this.props.fieldListMergedStore.getFieldList()
  }

  handleCreate = () => {
    linkTo({
      url: '/conf/field/create',
      pageKey: 'field_create',
      history: this.props.history
    })
  }

  render() {
    const { fieldListMergedStore, globalStore } = this.props
    const { fieldInsert } = globalStore.configAuthor
    const { query, selectedFieldGroup } = fieldListMergedStore
    const { wd, type, scope } = query || {}

    return (
      <div className={styles.widgets}>
        <div>
          {!!window.LOWCODE_APP_KEY && <AppDataTabs style={{ marginRight: '8px' }} />}
          <Select
            style={{ width: 180 }}
            value={query.scope}
            onChange={(value) => this.handleChange(value, 'scope')}
          >
            <Select.Option key="2">扩展字段</Select.Option>
            <Select.Option key="1">内置字段</Select.Option>
          </Select>
          <Input.Search
            style={{ width: 180, marginLeft: 8 }}
            placeholder={i18n('input_keyword', '请输入关键字')}
            allowClear
            value={wd}
            enterButton
            onChange={(e) => this.handleChange(e.target.value, 'wd')}
            onSearch={this.handleSearch}
          />
          {scope === '2' && (
            <FieldGroupLazySelect
              style={{ width: 180, marginLeft: 8, verticalAlign: 'bottom' }}
              clearOnClose
              labelInValue
              value={selectedFieldGroup}
              onChange={this.handleFieldGroupChange}
            />
          )}
          <Select
            allowClear
            showSearch
            value={type}
            style={{ width: 180, marginLeft: 8 }}
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
        {orLowcode(fieldInsert) && scope === '2' && (
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
