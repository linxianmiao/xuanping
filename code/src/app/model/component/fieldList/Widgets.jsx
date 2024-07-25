import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { withRouter } from 'react-router-dom'
import { Input, Select, Button } from '@uyun/components'
import { getFieldList } from '~/components/formSet/formLayoutVos/configuration'
import FieldGroupLazySelect from '~/components/FieldGroupSelect/LazySelect'
import { linkTo } from '~/components/LowcodeLink'
import { orLowcode } from '~/utils/common'
import styles from './index.module.less'

@inject('modelFieldListStore', 'globalStore', 'basicInfoStore')
@withRouter
@observer
class Widgets extends Component {
  handleChange = (data, type) => {
    const { query } = this.props.modelFieldListStore
    this.props.modelFieldListStore.setProps({
      query: _.assign({}, query, { [type]: data })
    })
    // 不是输入框变化，或者清空输入框
    if (type !== 'wd' || !data) {
      this.handleSearch()
    }
  }

  handleFieldGroupChange = (value) => {
    const { query } = this.props.modelFieldListStore
    this.props.modelFieldListStore.setProps({
      query: _.assign({}, query, { layoutId: value && value.key }),
      selectedFieldGroup: value
    })
    this.handleSearch()
  }

  handleSearch = () => {
    const { query } = this.props.modelFieldListStore
    this.props.modelFieldListStore.setProps({ query: { ...query, pageNo: 1 } })
    this.props.modelFieldListStore.getFieldList()
  }

  handleCreate = () => {
    linkTo({
      history: this.props.history,
      url: `/conf/model/advanced/field/create?modelId=${this.props.modelId}`,
      pageKey: 'field_create',
      modelId: this.props.modelId
    })
  }

  render() {
    const { modelId, modelFieldListStore, globalStore, basicInfoStore } = this.props
    const {
      configAuthor: { fieldInsert },
      showStatusButton
    } = globalStore
    const { modelStatus } = basicInfoStore
    const { query, selectedFieldGroup } = modelFieldListStore
    const { wd, type } = query || {}
    const widgetWidth = modelId ? 198 : 256
    const canOperate = showStatusButton || modelStatus === -1 || window.LOWCODE_APP_KEY

    return (
      <div className={styles.widgets}>
        <div>
          <Input.Search
            style={{ width: widgetWidth, marginRight: 15 }}
            placeholder={i18n('input_keyword', '请输入关键字')}
            allowClear
            enterButton
            value={wd}
            onChange={(e) => this.handleChange(e.target.value, 'wd')}
            onSearch={this.handleSearch}
          />
          <FieldGroupLazySelect
            style={{ width: widgetWidth, marginRight: 15, verticalAlign: 'bottom' }}
            clearOnClose
            labelInValue
            value={selectedFieldGroup}
            onChange={this.handleFieldGroupChange}
          />
          <Select
            allowClear
            showSearch
            value={type}
            style={{ width: widgetWidth }}
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
        {orLowcode(canOperate && fieldInsert) && (
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
