import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import { Button, message, Input } from '@uyun/components'
import ModelTypeLazySelect from '~/components/ModelTypeSelect/LazySelect'
import AppSelect from '~/components/AppSelect'
import { linkTo } from '~/components/LowcodeLink'
import Import from '../component/import'

@inject('modelListStore', 'globalStore')
@withRouter
@observer
class ModelListHeader extends Component {
  state = {
    data: [],
    scrollPage: 1,
    total: 0
  }

  handleCreate = async () => {
    const res = await this.props.modelListStore.getGroupList({ page_num: 1, page_size: 1 })
    if (res.length === 0) {
      message.info(i18n('add_group_info', '请新建分组'))
      return false
    }
    let url = '/conf/model/advancedCreate'

    linkTo({
      url: url,
      pageKey: 'model_create',
      modelId: '',
      history: this.props.history
    })
    // this.props.history.push('/conf/model/advancedCreate')
  }

  handleFilterChange = (value, field) => {
    this.props.onFilterChange({ [field]: value })
  }

  handleModelTypeChange = (value) => {
    this.handleFilterChange(value && value.key, 'classification')
    this.props.modelListStore.setValue({ selectedModelType: value })
    this.handleSearch()
  }

  handleAppSelect = (value) => {
    this.handleFilterChange(value && value.key, 'appCode')
    this.props.modelListStore.setValue({ selectedApp: value })
    this.handleSearch()
  }

  handleSearch = () => {
    this.handleFilterChange(1, 'pageNo')
    this.props.onQuery()
  }

  render() {
    const { query, selectedApp, selectedModelType } = this.props.modelListStore
    const { modelInsert } = this.props.globalStore.configAuthor
    return (
      <div className="model-list-header">
        <div>
          <Input.Search
            placeholder={i18n('input_keyword', '请输入关键字')}
            style={{ width: 180, marginRight: 15, verticalAlign: 'top' }}
            allowClear
            enterButton
            value={query.kw}
            onChange={(e) => this.handleFilterChange(e.target.value, 'kw')}
            onSearch={() => this.handleSearch()}
            onClear={() => this.handleSearch()}
          />
          <ModelTypeLazySelect
            style={{ width: 180, marginRight: 15 }}
            value={selectedModelType}
            onChange={this.handleModelTypeChange}
            labelInValue
          />
          {/* <AppSelect
            placeholder={`${i18n('ticket.create.select')}${i18n('in.which.app')}`}
            style={{ width: 180 }}
            value={selectedApp}
            onChange={this.handleAppSelect}
          /> */}
        </div>

        <div>
          <Import />
          {(modelInsert || window.LOWCODE_APP_KEY) && (
            <Button type="primary" onClick={this.handleCreate}>
              {i18n('new_model', '新建模型')}
            </Button>
          )}
        </div>
      </div>
    )
  }
}

export default ModelListHeader
