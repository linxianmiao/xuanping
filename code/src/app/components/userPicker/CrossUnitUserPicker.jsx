import React from 'react'
import { inject, observer } from 'mobx-react'
import PickerPane from './pickerPane'
import BasicPicker from './basicPicker'
import { StoreConsumer } from './config'

@inject('userPickStore')
@observer
class CrossUnitUserPicker extends BasicPicker {
  static defaultProps = {
    extendQuery: {}
  }

  get extendQuery() {
    return {
      type: 7,
      modelId: this.props.extendQuery.modelId
    }
  }

  getList = async () => {
    const { query, isAdd } = this.state
    const params = { ...query, ...this.extendQuery }
    const res = await this.props.userPickStore.getCrossUnitUsersAndGroups(params)

    this.setState({
      list: isAdd ? [...this.state.list, ...res.list] : res.list,
      total: res.count || 0
    })
  }

  handleChangeAdd = (isAdd) => {
    this.setState({ isAdd })
  }

  render() {
    const { rowKey, type } = this.props
    const { query, list } = this.state
    const selectedRowKeys = _.filter(
      this.props.value.all,
      (item) => item.type === 'crossUnitUsers'
    ).map((item) => item.id)
    const columns = [
      {
        title: i18n('name', '名称'),
        dataIndex: 'name'
      },
      {
        title: i18n('account', '账号'),
        dataIndex: 'account'
      },
      {
        title: i18n('field.department', '部门'),
        dataIndex: 'userDepartment',
        render: (departs) => (departs ? departs.join(',') : '')
      },
      {
        title: i18n('email', '邮箱'),
        dataIndex: 'mail'
      }
    ]

    let nextTotal = Infinity

    if (list.length < query.pageSize) {
      nextTotal = (query.pageNo - 1) * query.pageSize + list.length
    }

    return (
      <StoreConsumer>
        {({ props }) => (
          <PickerPane
            query={query}
            columns={columns}
            dataSource={list}
            total={nextTotal}
            type={type}
            rowKey={rowKey}
            selectionType={props.selectionType}
            selectedRowKeys={selectedRowKeys}
            onSelectAll={this.onSelect}
            onSelect={this.onSelect}
            handleChangeQuery={this.handleChangeQuery}
            handleChangeAdd={this.handleChangeAdd}
          />
        )}
      </StoreConsumer>
    )
  }
}

export default CrossUnitUserPicker
