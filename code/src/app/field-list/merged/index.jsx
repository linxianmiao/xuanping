import React, { Component } from 'react'
import { inject, observer, Provider } from 'mobx-react'

import Widgets from './Widgets'
import Table from './Table'
import Move from './Move'
import styles from './index.module.less'
import fieldListMergedStore from './fieldListMergedStore'

export default class MergedFieldList extends Component {
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
      <Provider store={fieldListMergedStore}>
        <div style={{ height: '100%' }}>
          <Widgets onSelectChange={this.onSelectChange} />
          <div className={styles.tableContainer}>
            <Table
              onVisibleChange={this.handleVisibleChange}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={this.onSelectChange}
            />
          </div>
          <Move visible={visible} item={item} onVisibleChange={this.handleVisibleChange} />
        </div>
      </Provider>
    )
  }
}
