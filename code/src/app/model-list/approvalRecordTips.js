import React from 'react'
import { Icon } from '@uyun/components'
import { inject } from 'mobx-react'

@inject('modelListStore', 'globalStore')
export default class RecordTips extends React.Component {
    state={
      visible: false
    }

hoverIcon = () => {
  this.timer && clearTimeout(this.timer)
  this.timer = setTimeout(() => {
    this.setState({
      visible: true
    })
  }, 100)
}

hoveroutIcon = () => {
  this.timer && clearTimeout(this.timer)
  this.timer = setTimeout(() => {
    this.setState({
      visible: false
    })
  }, 100)
}

deleteAuthComment = async id => {
  await this.props.modelListStore.deleteAuthComment(id)
  this.props.modelListStore.getConfModelList()
}

render() {
  const { text, record = {} } = this.props
  const { visible } = this.state
  return <div className="model_list_modelstatus_close_tips">
    <div className="wrap">
      <span onMouseOver={this.hoverIcon}>{text === -1 ? <span className="wrap_status">开发中</span> : text === 0 ? '待审核' : text === 1 ? <span style={{ color: '#28B053' }}>已发布</span> : null}</span>
      {
        record.comment
          ? <span onMouseOver={this.hoverIcon} onMouseOut={this.hoveroutIcon}>
            <i className="iconfont icon-gengduo-shise icon1" />
            <div className="tips" style={{ display: visible ? 'block' : 'none' }} onMouseOver={this.hoverIcon} onMouseOut={this.hoveroutIcon}>
              <div className="tips_wrap">
                <div className="tips_wrap_content">
                  <div className="tips_wrap_content_div">审批失败原因</div>
                  <div>{record.comment}</div>
                </div>
                <span className="span2" onClick={() => { this.deleteAuthComment(record.id) }}>不再提醒</span>
              </div>
            </div>
          </span>
          : null
      }
    </div>
  </div>
}
}