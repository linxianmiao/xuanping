/**
 * F型布局
 */
import React, { Component } from 'react'
import DoubleColumnsLayout from './DoubleColumnsLayout'
import styles from './index.module.less'

class FShapeLayout extends Component {
  render() {
    const { children, ...restProps } = this.props

    return (
      <DoubleColumnsLayout className={styles.fshape} {...restProps}>
        {children}
      </DoubleColumnsLayout>
    )
  }
}

FShapeLayout.Left = ({
  header,
  extra,
  children
}) => {
  return (
    <DoubleColumnsLayout.Left>
      <div className={styles.header}>
        {header}
        <div className={styles.extra}>
          {extra}
        </div>
      </div>
      <div className={styles.body}>
        {children}
      </div>
    </DoubleColumnsLayout.Left>
  )
}

FShapeLayout.Right = ({
  header,
  children
}) => {
  return (
    <DoubleColumnsLayout.Right>
      <div className={styles.header}>
        {header}
      </div>
      <div className={styles.body}>
        {children}
      </div>
    </DoubleColumnsLayout.Right>
  )
}

export default FShapeLayout
