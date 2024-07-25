import React, { Component, Fragment } from 'react'
import { inject } from 'mobx-react'
import { message } from '@uyun/components'
import Header from './Header'
import Table from './Table'

@inject('modelListStore')
class ReviewList extends Component {
  state = {
    selectedRowKeys: [],
    selectedRows: []
  }

  componentDidMount() {
    this.handleQuery()
  }

  handleFilterChange = filters => {
    const { reviewQuery, setValue } = this.props.modelListStore

    setValue({ reviewQuery: { ...reviewQuery, ...filters } })
  }

  handleQuery = () => {
    this.props.modelListStore.queryModelWaitingAuth()
  }

  handleSelectRows = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows })
  }

  handlePass = async records => {
    const doAuthParamsVoList = _.map(records, item => ({ id: item.id, authStatus: 1, comment: '', modelId: item.modelId }))
    const data = {
      name: '',
      sorts: 1,
      doAuthParamsVoList
    }
    const res = await this.props.modelListStore.doAuthModel(data)
    if (res === '200') {
      message.success(i18n('w200'))
      this.handleQuery()
    }
  }

  render() {
    const { selectedRows, selectedRowKeys } = this.state
    const commonProps = {
      onFilterChange: this.handleFilterChange,
      onQuery: this.handleQuery,
      onPass: this.handlePass
    }

    return (
      <Fragment>
        <Header {...commonProps} selectedRows={selectedRows} />
        <Table
          {...commonProps}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={this.handleSelectRows}
        />
      </Fragment>
    )
  }
}

export default ReviewList
