import React, { Component } from 'react'

export default class TempCreate extends Component {
  static defaultProps = {
    handleChangeTempData: () => {}
  }

  render() {
    return (
      <span
        className="iconfont-wrap"
        onClick={() => {
          this.props.handleChangeTempData({})
        }}
      >
        {<i className="iconfont icon-save" />}
        {i18n('save-ticket-template')}
      </span>
    )
  }
}
