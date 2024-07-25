import React, { Component } from 'react'
import { observer } from 'mobx-react'
import './style/header.less'

@observer
class Header extends Component {
  render () {
    const { visibleKey } = this.props
    return (
      <div className="model-header">
        <div className="model-header-btn">
          <span className={`${visibleKey === '1' ? 'active' : ''}`} onClick={() => { this.props.changeVisbleKey('1') }}> {i18n('conf.model.basicInfo', '基本信息')}</span>
          <span className={`${visibleKey === '5' ? 'active' : ''}`} onClick={() => { this.props.changeVisbleKey('5') }}> {i18n('field.setting', '字段设置')}</span>
          <span className={`${visibleKey === '2' ? 'active' : ''}`} onClick={() => { this.props.changeVisbleKey('2') }}>{i18n('conf.model.fieldsSet', '表单设置')}</span>
          <span className={`${visibleKey === '3' ? 'active' : ''}`} onClick={() => { this.props.changeVisbleKey('3') }}>{i18n('conf.model.Process.design', '流程设计')}</span>
          <span className={`${visibleKey === '4' ? 'active' : ''}`} onClick={() => { this.props.changeVisbleKey('4') }}>{i18n('conf.model.Process.paramsSetting', '变量设置')}</span>
        </div>
      </div>
    )
  }
}

export default Header
