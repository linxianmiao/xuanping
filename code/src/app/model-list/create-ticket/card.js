import React, { Component } from 'react'
import { Tooltip } from '@uyun/components'
import classnames from 'classnames'
export default class ITSMCrad extends Component {
  render () {
    const { id, name, icon, imgurl, modal, style, sharedBusinessUnitName, selectList, mode } = this.props
    return (
      <Tooltip title={modal.description}>
        <div className="create-ticket-modal-card-item-wrap" key={id}>
          <div
            style={style}
            className={classnames('create-ticket-modal-card-item', {
              selected: _.some(selectList, item => item.id === id),
              isHover: mode === 'link'
            })}
            onClick={() => { this.props.handleClick(modal) }}
          >
            {icon === 'define' ? <img src={imgurl} /> : <i className={`iconfont icon-${icon}`} />}
            <span className="process-name-wrap">{name}</span>
            {sharedBusinessUnitName ? <Tooltip title={`${i18n('from', '来自')}${sharedBusinessUnitName}`}>
              <i className="iconfont icon-fenxiangjiaobiao" />
            </Tooltip> : null}
          </div>
        </div>
      </Tooltip>
    )
  }
}
