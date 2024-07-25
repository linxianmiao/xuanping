import React, { Component } from 'react'
import { Input } from '@uyun/components'
import './style/advancedScreen.less'

class AdvancedScreen extends Component {
    handleChange = val => {
      this.props.handleScreenData({ wd: val })
    }

    render () {
      const { showScreen } = this.props
      return (
        <div className="screen-inner clearfix">
          <div className="screen-search">
            <i className="iconfont icon-sousuo" />
            <Input
              className="search"
              value={this.props.searchData.wd}
              onChange={e => { this.handleChange(e.target.value) }}
              placeholder={i18n('ticket.list.screent.kw', '请输入关键字')} />
          </div>
          <div className={`more-screen ${showScreen ? 'show' : 'hide'}`} onClick={() => { this.props.handleScreen() }}>
            {!showScreen && <span>高级筛选 <i className="icon-xiatui iconfont" /></span>}
            {showScreen && <span>收起筛选<i className="icon-shangtui iconfont" /></span>}
          </div>
        </div>
      )
    }
}

export default AdvancedScreen
