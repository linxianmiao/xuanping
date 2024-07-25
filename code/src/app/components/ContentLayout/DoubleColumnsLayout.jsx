/**
 * 两列布局
 */
import React, { Component } from 'react'
import styles from './index.module.less'

class DoubleColumnsLayout extends Component {
  render() {
    const { className, style, children } = this.props
    const clsName = `${styles.wrapper} ${className}`

    return <div className={clsName} style={style}>{children}</div>
  }
}

DoubleColumnsLayout.Left = ({ children, className, style }) => {
  const clsName = `${styles.left} ${className}`
  return (
    <div className={clsName} style={style}>{children}</div>
  )
}

DoubleColumnsLayout.Right = ({ children, className, style }) => {
  const clsName = `${styles.right} ${className}`
  return (
    <div className={clsName} style={style}>{children}</div>
  )
}

export default DoubleColumnsLayout
