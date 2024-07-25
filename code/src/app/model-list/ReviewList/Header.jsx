import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import { Select, Input, Button } from '@uyun/components'

const Option = Select.Option

@inject('modelListStore')
@observer
class ReviewListHeader extends Component {
  handleFilterChange = (value, field) => {
    this.props.onFilterChange({ [field]: value })
  }

  handleSearch = () => {
    this.handleFilterChange(1, 'pageNo')
    this.props.onQuery()
  }

  render() {
    const { selectedRows, onPass } = this.props
    const { reviewQuery } = this.props.modelListStore

    return (
      <div className="model-list-header">
        <div>
          <Input.Search
            placeholder={i18n('input_keyword', '请输入关键字')}
            style={{ width: 240, marginRight: 15, verticalAlign: 'top' }}
            allowClear
            enterButton
            value={reviewQuery.kw}
            onChange={(e) => this.handleFilterChange(e.target.value, 'kw')}
            onSearch={() => this.handleSearch()}
            onClear={() => this.handleSearch()}
          />
          <Select
            placeholder={i18n('Pleact.select.type', '请选择申请类别')}
            style={{ width: 240, marginRight: 15, verticalAlign: 'top' }}
            value={reviewQuery.applyType}
            optionFilterProp="children"
            allowClear
            onChange={(value) => {
              this.handleFilterChange(value, 'applyType')
              this.handleSearch()
            }}
          >
            <Option value="1">启用</Option>
            <Option value="2">停用</Option>
            {/* <Option value="3">发布</Option> */}
            <Option value="4">删除</Option>
          </Select>
        </div>
        <div>
          <Button
            style={{ marginRight: 10 }}
            type="primary"
            disabled={_.isEmpty(selectedRows)}
            onClick={() => onPass(selectedRows)}
          >
            通过
          </Button>
          <Link to={{ pathname: '/conf/model/approval' }}>
            <Button type="primary">{i18n('layout.modelAppraval', '审批记录')}</Button>
          </Link>
        </div>
      </div>
    )
  }
}

export default ReviewListHeader
