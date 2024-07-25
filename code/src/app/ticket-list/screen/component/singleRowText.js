import React, { Component } from 'react'
import { Input } from '@uyun/components'

class SingleRowText extends Component {
    handleChagne = val => {
      this.props.handleScreenData({ [this.props.item.value]: val })
    }

    render () {
      const { item } = this.props
      return (
        <div className="screen-item-wrap">
          <div className="screen-item-inner">
            <span className="screen-item-label">{item.label}</span>
            <Input
              value={this.props.initValue}
              onChange={e => this.handleChagne(e.target.value)}
              placeholder={i18n('ticket.list.screent.kw', '请输入关键字')} />
          </div>
        </div>
      )
    }
}

export default SingleRowText
