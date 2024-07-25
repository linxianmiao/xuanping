/**
 * 模型列表
 * 按模型分组分
 */
import React, { Component } from 'react'
import { inject } from '@uyun/core'
import ModelGroupList from './ModelGroupList'
import ModelList from './ModelList'

import styles from './index.module.less'

class Index extends Component {
  @inject('api') api

  state = {
    groupId: 'all', // 当前选中的类型code, all为全部, follow为收藏
    selectedModelIds: [] // 已选的模型id
  }

  componentDidMount() {
    this.querySelectedModelIds()
  }

  _getSelectedModelIds = () => {
    return this.state.selectedModelIds.slice()
  }

  querySelectedModelIds = async () => {
    const res = await this.api.querySelectedModels() || []

    this.setState({ selectedModelIds: res.map(item => item.processId) })
  }

  handleGroupChange = groupId => {
    this.setState({ groupId })
  }

  handleModelSelect = model => {
    this.setState(prevState => {
      const { selectedModelIds } = prevState
      let nextSelectedModelIds = selectedModelIds.slice()
      const index = selectedModelIds.indexOf(model.processId)

      if (index > -1) {
        nextSelectedModelIds = nextSelectedModelIds.filter(id => id !== model.processId)
      } else {
        nextSelectedModelIds.push(model.processId)
      }

      return {
        selectedModelIds: nextSelectedModelIds
      }
    })
  }

  render() {
    const { groupId, selectedModelIds } = this.state

    return (
      <div className={styles.mbt}>
        <div className={styles.mbtLeft}>
          <ModelGroupList groupId={groupId} onChange={this.handleGroupChange} />
        </div>
        <div className={styles.mbtRight}>
          <ModelList groupId={groupId} selectedModelIds={selectedModelIds} onSelect={this.handleModelSelect} />
        </div>
      </div>
    )
  }
}

export default Index
