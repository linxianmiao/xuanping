import React, { Component } from 'react'
import { Tabs } from '@uyun/components'
import ModelList from './model'
import TacheList from './tache'
import styles from './index.module.less'
const TabPane = Tabs.TabPane

export default class Tab extends Component {
  state = {
    activeKey: '1',
    currentModel: {}
  }

  handleChangeValueList = (item, type) => {
    if (type === 'model') {
      this.setState({ activeKey: '2', currentModel: item })
    } else {
      let data = { ...this.state.currentModel, ...item }
      this.props.handleChangeValueList([{ ...data }])
    }
  }

  handleChangeActiveKey = (activeKey) => {
    this.setState({ activeKey })
  }

  render () {
    const { activeKey, currentModel } = this.state
    const { valueList } = this.props
    return (
      <div className={styles.tacheList}>
        <Tabs type="card" activeKey={activeKey} onChange={this.handleChangeActiveKey}>
          <TabPane key="1" tab="模型列表">
            <ModelList
              valueList={valueList}
              handleChangeValueList={(item) => { this.handleChangeValueList(item, 'model') }} />
          </TabPane>
          {
            currentModel.modelId &&
            <TabPane key="2" tab="环节列表">
              <TacheList
                valueList={valueList}
                currentModelId={currentModel.modelId}
                handleChangeValueList={(item) => { this.handleChangeValueList(item, 'tache') }} />
            </TabPane>
          }
        </Tabs>
      </div>
    )
  }
}
