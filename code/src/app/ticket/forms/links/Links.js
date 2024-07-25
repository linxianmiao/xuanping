import React, { Component } from 'react'
import classnames from 'classnames'
import EditModal from './Edit'

export default class Links extends Component {
  state={
    visible: false
  }

  edit = () => { this.setState({ visible: true }) }

  onCancel = () => { this.setState({ visible: false }) }

  handleOk = (value) => {
    this.props.onChange(value)
    this.onCancel()
  }

  _render = (linkData) => {
    return <a target="_blank" href={`${linkData.linkProtocol}${linkData.linkUrl}`}>{linkData.linkName}</a>
  }

  render () {
    const { value: linkData, disabled } = this.props
    const { visible } = this.state
    return (
      <div className={classnames({
        'disabled-item': disabled
      })}>
        <a target="_blank" href={`${linkData.linkProtocol}${linkData.linkUrl}`}>{linkData.linkName}</a>
        <i className="iconfont icon-bianji" onClick={this.edit} style={{ marginLeft: '4px', fontSize: '12px', cursor: 'pointer' }}><span>{'编辑'}</span></i>
        {visible && <EditModal visible={visible} onCancel={this.onCancel} linkData={linkData} handleOk={this.handleOk} />}
      </div>
    )
  }
}
