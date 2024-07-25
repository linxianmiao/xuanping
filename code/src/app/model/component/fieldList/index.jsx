import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import Widgets from './Widgets'
import Table from './Table'
import Move from './Move'
import styles from './index.module.less'

@inject('modelFieldListStore')
@observer
class FieldList extends Component {
  static defaultProps = {
    modelId: '' // 有modelId表示是模型中字段设置的列表
  }

  state = {
    visible: '',
    item: null
  }

  handleVisibleChange = (visible, item) => {
    this.setState({
      visible,
      item
    })
  }

  render() {
    const { modelId } = this.props
    const { visible, item } = this.state
    return (
      <div className={styles.wrapper}>
        <Widgets modelId={modelId} />
        <Table
          modelId={modelId}
          onVisibleChange={this.handleVisibleChange}
        />
        <Move visible={visible} item={item} onVisibleChange={this.handleVisibleChange} />
      </div>
    )
  }
}

export default FieldList
