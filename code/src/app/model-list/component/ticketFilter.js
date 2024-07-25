import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Input, Select, Spin } from '@uyun/components'
import LazySelect from '~/components/lazyLoad/lazySelect'
const { Option } = Select

@inject('modelListStore')
@observer
class TicketFilter extends Component {
  state = {
    loading: false,
    list: []
  }

  onLoad = async () => {
    const { categoryList } = this.props.modelListStore
    if (_.isEmpty(categoryList)) {
      this.setState({ loading: true })
      await this.props.modelListStore.queryCategory()
      this.setState({ loading: false })
    }
  }

  getList = async (query, callback) => {
    const res = await this.props.modelListStore.getGroupList(query)
    const list = _.map(res, item => ({ name: item.name, id: item.id }))
    callback(list)
  }

  handleChangeQuery = (value, type) => {
    const { query } = this.props
    this.props.handleChangeQuery(_.assign({}, query, { [type]: value, pageNo: 1 }))
  }

  render() {
    const { kw, layoutId, classification } = this.props.query || {}
    const { categoryList } = this.props.modelListStore
    const { loading } = this.state
    return (
      <div className="ticket-filter">
        <Input.Search
          value={kw}
          allowClear
          style={{ width: 240, marginRight: 15 }}
          onChange={(e) => { this.handleChangeQuery(e.target.value, 'kw') }}
          placeholder={i18n('input_keyword', '请输入关键字')} />
        <LazySelect
          lazy={false}
          value={layoutId}
          labelInValue={false}
          style={{ width: 240, marginRight: 15 }}
          onChange={(value) => { this.handleChangeQuery(value, 'layoutId') }}
          getList={this.getList}
          placeholder={i18n('pls_select_group', '请选择分组')} />
        <Select
          allowClear
          showSearch
          style={{ width: 240 }}
          value={classification}
          optionFilterProp="children"
          onChange={(value) => { this.handleChangeQuery(value, 'classification') }}
          onDropdownVisibleChange={() => { this.onLoad() }}
          placeholder={`${i18n('pls_select_modelType', '请选择模型类型')}`}
          notFoundContent={loading ? <Spin size="small" /> : i18n('ticket.comment.notfind', '无法找到')}>
          {_.map(categoryList, item => <Option value={item.key} key={item.key}>{item.label}</Option>)}
        </Select>
      </div>
    )
  }
}
export default TicketFilter