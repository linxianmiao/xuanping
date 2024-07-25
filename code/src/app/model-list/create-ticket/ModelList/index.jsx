/**
 * 模型列表
 * 按类型分
 */
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import ModelGroupList from './ModelGroupList'
import ModelList from './ModelList'
import './index.less'

@withRouter
class Index extends Component {
  state = {
    groupId: 'all' // 当前选中的类型code, all为全部, follow为收藏
  }

  handleGroupChange = groupId => {
    this.setState({ groupId })
  }

  handleModelSelect = model => {
    const { mode, selectList } = this.props
    if (mode === 'link') {
      this.props.handleChange(false)
      // externalURL 外部表单URL
      const { processId, externalURL } = model
      if (externalURL) {
        window.open(externalURL)
      } else {
        this.props.history.push({
          pathname: `/ticket/createTicket/${processId}`
        })
      }
    } else {
      if (_.some(selectList, data => data.processId === model.processId)) {
        this.props.handleChangeSelectList(_.filter(selectList, data => data.processId !== model.processId))
      } else {
        this.props.handleChangeSelectList([...selectList, _.assign({}, model, { type: 'model' })])
      }
    }
  }

  render() {
    const { showFollow, selectList, mode } = this.props
    const { groupId } = this.state
    return (
      <div className="mbt">
        <div className="mbt-left">
          <ModelGroupList groupId={groupId} showFollow={showFollow} onChange={this.handleGroupChange} />
        </div>
        <div className="mbt-right">
          <ModelList mode={mode} selectList={selectList} groupId={groupId} showFollow={showFollow} onSelect={this.handleModelSelect} />
        </div>
      </div>
    )
  }
}

export default Index
