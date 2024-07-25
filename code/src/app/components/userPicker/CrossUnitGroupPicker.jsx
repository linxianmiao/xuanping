import React from 'react'
import { inject, observer } from 'mobx-react'
import PickerPane from './pickerPane'
import BasicPicker from './basicPicker'
import { StoreConsumer } from './config'

@inject('userPickStore')
@observer
export default class CrossUnitGroupPicker extends BasicPicker {
  static defaultProps = {
    extendQuery: {}
  }

  get extendQuery() {
    return {
      type: 8,
      modelId: this.props.extendQuery.modelId
    }
  }

  getList = async () => {
    const { query } = this.state
    const params = { ...query, ...this.extendQuery }
    const res = await this.props.userPickStore.getCrossUnitUsersAndGroups(params)

    this.setState({
      list: res.list,
      total: res.count || 0
    })
  }

  render() {
    const { rowKey, type } = this.props
    const { query, list } = this.state
    const selectedRowKeys = _.filter(this.props.value.all, item => item.type === 'crossUnitGroups').map(item => item.id)
    const columns = [
      {
        title: i18n('name', '名称'),
        dataIndex: 'name'
      },
      {
        title: "租户",
        dataIndex: 'businessUnit'
      }
    ]

    return (
      <StoreConsumer>
        {
          ({ props }) => (
            <PickerPane
              query={query}
              columns={columns}
              dataSource={list}
              type={type}
              rowKey={rowKey}
              selectionType={props.selectionType}
              selectedRowKeys={selectedRowKeys}
              onSelectAll={this.onSelect}
              onSelect={this.onSelect}
              handleChangeQuery={this.handleChangeQuery}
            />
          )
        }
      </StoreConsumer>
    )
  }
}
