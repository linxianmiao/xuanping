import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { observer, inject } from 'mobx-react'
import { PlusOutlined } from '@uyun/icons'
import { Input, Select, Button } from '@uyun/components'
import '../styles/policyHeader.less'
const Search = Input.Search
const Option = Select.Option

@inject('policyStore')
@withRouter
@observer
class PolicyIndex extends Component {
  handleChange = (value, field) => {
    const { queryData } = this.props.policyStore

    this.props.policyStore.queryData = { ...queryData, [field]: value }
  }

  handleSearch = () => {
    const { queryData } = this.props.policyStore

    this.props.policyStore.queryData = { ...queryData, current: 1 }
    this.props.policyStore.getPolicyList()
  }

  handleChangeModel = (modelId) => {
    const { queryData } = this.props.policyStore
    this.props.policyStore.queryData = _.assign({}, queryData, { modelId })
    this.props.policyStore.getPolicyList()
  }

  onDropdownVisibleChange = () => {
    const { modelList } = this.props.policyStore
    if (_.isEmpty(modelList)) {
      this.props.policyStore.getModelList()
    }
  }

  render() {
    const { slaStrategyInsert } = this.props
    const { queryData, modelList } = this.props.policyStore
    const { kw, modelId } = queryData
    return (
      <div className="sla-header-wrap">
        <div>
          <Search
            placeholder={i18n('globe.keywords', '请输入关键字')}
            value={kw}
            allowClear
            enterButton
            style={{ width: 256 }}
            onChange={(e) => this.handleChange(e.target.value, 'kw')}
            onSearch={() => this.handleSearch()}
            onClear={() => this.handleSearch()}
          />
          <Select
            allowClear
            showSearch
            value={modelId}
            onChange={(value) => {
              this.handleChange(value, 'modelId')
              this.handleSearch()
            }}
            onDropdownVisibleChange={this.onDropdownVisibleChange}
            placeholder={i18n('globe.select', '请选择')}
            style={{ width: 200, marginLeft: 15 }}
            filterOption={(input, option) => {
              return (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }}
          >
            {_.map(modelList, (model) => (
              <Option key={model.processId} value={model.processId}>
                {model.processName}
              </Option>
            ))}
          </Select>
        </div>
        {slaStrategyInsert && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              this.props.history.push('/conf/sla/policy/create')
            }}
          >
            {i18n('sla_add_policy', '新增SLA策略')}
          </Button>
        )}
      </div>
    )
  }
}

export default PolicyIndex
