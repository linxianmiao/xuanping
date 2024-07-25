import React from 'react'
import { store as runtimeStore } from '@uyun/runtime-react'
import classnames from 'classnames'

export default class Index extends React.Component {
  static defaultProps = {
    heightFixed: false
  }

  render() {
    const { heightFixed, style } = this.props
    const styles = {}

    const { headerHeight } = runtimeStore.getState()

    if (heightFixed) {
      if (window?.name === 'Modellistapp') {
        styles.height = 'calc(100vh - 16px)'
      } else {
        styles.height = `calc(100vh - ${60 + headerHeight}px)`
      }
      styles.overflow = 'auto'
    } else {
      styles.minHeight = `calc(100vh - ${60 + headerHeight}px)`
    }

    if (window.LOWCODE_APP_KEY) {
      delete styles.minHeight
      styles.height = '100%'
    }

    const className = classnames({
      'content-layout': !window.LOWCODE_APP_KEY
    })

    return (
      <div className={className} style={{ ...styles, ...style }}>
        {this.props.children}
      </div>
    )
  }
}
