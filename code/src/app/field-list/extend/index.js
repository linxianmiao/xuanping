import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { message } from '@uyun/components'
import Widgets from './widgets'
import Table from './table'
import Move from './move'
import CreateLayout from './createLayout'

@inject('fieldListExtendStore', 'globalStore', 'fieldListStore')
@observer
class ExtendFieldList extends Component {
  state = {
    visible: '',
    item: null,
    selectedRowKeys: []
  }

  handleVisibleChange = (visible, item) => {
    this.setState({
      visible,
      item
    })
  }

  onSelectChange = (selectedRowKeys = []) => {
    this.setState({ selectedRowKeys })
  }

  render() {
    const { visible, item, selectedRowKeys } = this.state
    return (
      <div className="extend-list">
        <Widgets onSelectChange={this.onSelectChange} appkey={this.props.appkey} />
        <Table
          onVisibleChange={this.handleVisibleChange}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={this.onSelectChange}
          appkey={this.props.appkey}
        />
        <Move visible={visible} item={item} onVisibleChange={this.handleVisibleChange} />
        <CreateLayout visible={visible} item={item} onVisibleChange={this.handleVisibleChange} />
      </div>
    )
  }
}

export default ExtendFieldList
