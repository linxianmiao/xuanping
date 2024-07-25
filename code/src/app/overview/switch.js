import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Radio, Tooltip } from '@uyun/components'
import './style/switch.less'

class Switch extends Component {
  render () {
    const { viewIndex } = this.props
    return (
      <div className="overview-switch">
        <Radio.Group value={viewIndex} buttonStyle="solid">
          <Tooltip placement="top" title={i18n('tip21', '个人工单总览')}>
            <Radio.Button value="1" onClick={() => { this.props.onChange('1') }}>
              <i className="icon iconfont icon-user2" />
            </Radio.Button>
          </Tooltip>
          <Tooltip placement="topRight" title={i18n('tip22', '租户工单总览')}>
            <Radio.Button value="2" onClick={() => { this.props.onChange('2') }}>
              <i className="icon iconfont icon-tuandui" /></Radio.Button>
          </Tooltip>
        </Radio.Group>
      </div>
    )
  }
}

Switch.propTypes = {
  onChange: PropTypes.func,
  viewIndex: PropTypes.string
}

export default Switch
